const responseHelper = require("../utils/response");
const Negosiasis = require("../models/negosiasis");
const LogNegosiasis = require("../models/log_negosiasis");
const pengajuans = require("../models/pengajuans");
const { NegotiationValidator } = require("../validation");
const invoices = require("../models/invoices");
const log_negosiasis = require("../models/log_negosiasis");
const notificationHelper = require("../utils/index").NotificationHelper;
const knex = require("../config/db");
const {
  sendInvoiceEmail,
  sendNegotiationStartEmail,
  sendNegotiationReplyEmail,
  sendNegotiationDealEmail,
  sendNegotiationRejectedEmail,
} = require("../utils/mailer");
const users = require("../models/users");
const logger = require("../utils/index").logger;
class NegotiationController {
  async getAllNegotiations(req, res) {
    try {
      const { page, limit, status } = req.query;
      const negosiasiList = await Negosiasis.getAllNegosiasis(
        page,
        limit,
        status,
      );
      return responseHelper.withPagination(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList.data,
        { page, limit, totalItems: negosiasiList.pagination.total, status },
      );
    } catch (error) {
      logger.error("An error occurred while fetching negosiasi data", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async startNegotiation(req, res) {
    const trx = await knex.transaction();
    try {
      const { pengajuans_id, penawaran_return, penawaran_nominal, catatan } =
        req.body;
      const { id: investor_id } = req.user;

      // Cek pengajuan
      const pengajuan = await pengajuans.getPengajuanById(pengajuans_id);
      if (!pengajuan || pengajuan.status !== "published") {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Pengajuan not found or not published",
          404,
        );
      }

      // Cek negosiasi aktif (double check)
      const activeNegosiasi =
        await Negosiasis.getNegosiasiByPengajuanId(pengajuans_id);
      if (
        activeNegosiasi.length !== 0 &&
        activeNegosiasi.some((n) => n.status === "active")
      ) {
        await trx.rollback();
        return responseHelper.error(
          res,
          "An active negotiation already exists for this pengajuan",
          400,
        );
      }

      // Validation
      const { error } = NegotiationValidator.negotiationValidation({
        pengajuans_id,
        penawaran_return,
        penawaran_nominal,
        catatan,
      });
      if (error) {
        await trx.rollback();
        logger.error("Validation error while starting negotiation", { error });
        return responseHelper.error(res, error.details[0].message, 400);
      }

      await pengajuans.lockPengajuan(pengajuans_id, investor_id, trx);

      const negosiasi = await Negosiasis.createNegosiasi(
        pengajuans_id,
        investor_id,
        "active",
        investor_id,
        trx,
      );

      // Log penawaran pertama
      const log_negosiasi = await LogNegosiasis.createLogNegosiasi(
        negosiasi.id,
        investor_id,
        penawaran_return,
        penawaran_nominal,
        catatan,
        "investor", // diajukan_oleh
        "pending", // status log
        trx,
      );

      await trx.commit();

      const userUMKM = await users.getUserById(pengajuan.bisnis_user_id);

      if (userUMKM?.email) {
        sendNegotiationStartEmail(userUMKM.email, userUMKM.nama, {
          bisnis_nama: pengajuan.bisnis_nama,
          penawaran_nominal,
          penawaran_return,
          catatan,
          negosiasi_id: negosiasi.id,
        }).catch((err) =>
          logger.error("Failed to send negotiation start email", { err }),
        );
      }

      await notificationHelper.notifyStartNegotiation(
        pengajuans_id,
        negosiasi.id,
        penawaran_return,
        penawaran_nominal,
      );

      return responseHelper.success(res, "Negotiation started successfully", {
        negosiasi,
        log_negosiasi,
      });
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while creating negosiasi data", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while creating negosiasi data",
      );
    }
  }

  async getNegotiationByPengajuanId(req, res) {
    try {
      const { id: pengajuans_id } = req.params;
      const negosiasiList =
        await Negosiasis.getNegosiasiByPengajuanId(pengajuans_id);
      if (!negosiasiList || negosiasiList.length === 0) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList,
      );
    } catch (error) {
      logger.error("An error occurred while fetching negosiasi data", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async getNegotiationByUserId(req, res) {
    try {
      const { id: user_id } = req.user;
      const role = req.user.role_name;
      const negosiasiList = await Negosiasis.getNegosiasiByUserId(
        user_id,
        role,
      );
      if (!negosiasiList || negosiasiList.length === 0) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList,
      );
    } catch (error) {
      logger.error("An error occurred while fetching negosiasi data", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async getNegotiationById(req, res) {
    try {
      const { id } = req.params;
      const negosiasi = await Negosiasis.getNegosiasiById(id);
      if (!negosiasi) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasi,
      );
    } catch (error) {
      logger.error("An error occurred while fetching negosiasi data", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async replyNegotiation(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: negosiasi_id } = req.params;
      const { penawaran_return, penawaran_nominal, catatan } = req.body;
      const { id: user_id, role_name } = req.user;

      const negosiasi = await Negosiasis.getNegosiasiById(negosiasi_id, trx);
      if (!negosiasi || negosiasi.status !== "active") {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Negosiasi not found or not active",
          404,
        );
      }
      logger.info("Fetched negosiasi for reply", {
        isLastReplier:
          parseInt(negosiasi.id_terakhir_oleh) === parseInt(user_id),
      });
      if (parseInt(negosiasi.id_terakhir_oleh) === parseInt(user_id)) {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Waiting for opposite to reply before you can reply again",
          400,
        );
      }

      // Validation
      const { error } = NegotiationValidator.replyNegotiationValidation({
        penawaran_return,
        penawaran_nominal,
        catatan,
      });
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      await trx("log_negosiasis")
        .where({ negosiasis_id: negosiasi_id, status: "pending" })
        .update({ status: "rejected" });

      const diajukan_oleh = role_name === "investor" ? "investor" : "umkm";

      const log_negosiasi = await LogNegosiasis.createLogNegosiasi(
        negosiasi_id,
        user_id,
        penawaran_return,
        penawaran_nominal,
        catatan,
        diajukan_oleh,
        "pending",
        trx,
      );

      await Negosiasis.updateNegosiasi(negosiasi_id, "active", user_id, trx);

      await trx.commit();

      const userToNotifyId =
        role_name === "investor"
          ? negosiasi.bisnis_owner.id
          : negosiasi.investor.id;

      sendNegotiationReplyEmail(
        role_name === "investor"
          ? negosiasi.bisnis_owner.email
          : negosiasi.investor.email,
        role_name === "investor"
          ? negosiasi.bisnis_owner.nama
          : negosiasi.investor.nama,
        {
          bisnis_nama: negosiasi.bisnis?.nama,
          penawaran_nominal,
          penawaran_return,
          catatan,
          negosiasi_id,
          diajukan_oleh,
        },
      ).catch((err) =>
        logger.error("Failed to send negotiation reply email", { err }),
      );

      await notificationHelper.notifyReplyNegotiation(
        role_name === "investor"
          ? negosiasi.bisnis_owner.id
          : negosiasi.investor.id,
        negosiasi_id,
        "reply",
        catatan,
      );

      return responseHelper.success(res, "Reply to negotiation successfully", {
        log_negosiasi,
      });
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while replying to negosiasi", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while replying to negosiasi",
      );
    }
  }

  async acceptNegotiation(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: negosiasi_id } = req.params;
      const { catatan } = req.body;
      const { id: user_id, role_name } = req.user;

      const negosiasi = await Negosiasis.getNegosiasiById(negosiasi_id, trx);
      if (!negosiasi || negosiasi.status !== "active") {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Negosiasi not found or not active",
          404,
        );
      }

      const { error } = NegotiationValidator.acceptRejectNegotiationValidation({
        catatan,
      });
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const lastLog = await LogNegosiasis.getLastLogByNegosiasiId(
        negosiasi_id,
        trx,
      );
      if (!lastLog) {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Tidak ada penawaran yang bisa di-accept",
          400,
        );
      }

      await trx("log_negosiasis")
        .where({ negosiasis_id: negosiasi_id, status: "pending" })
        .update({ status: "accepted" });

      await Negosiasis.updateNegosiasi(negosiasi_id, "deal", user_id, trx);

      await trx("pengajuans").where({ id: negosiasi.pengajuan.id }).update({
        status: "funded",
        locked_by_investor_id: null,
        locked_at: null,
        per_anual_return: lastLog.penawaran_return, // sesuaikan nama kolom dengan DB
      });

      // Buat invoice — kalkulasi PPN + biaya admin ada di dalam createInvoice
      const kodePembayaran = `PAY-${Date.now()}`;
      const deadline = new Date();
      deadline.setHours(
        deadline.getHours() + parseInt(process.env.INVOICE_EXPIRY_HOURS || 24),
      );

      const invoice = await invoices.createInvoice(
        negosiasi_id,
        negosiasi.pengajuan.id,
        negosiasi.investor.id,
        lastLog.penawaran_nominal,
        lastLog.penawaran_return,
        kodePembayaran,
        deadline,
        trx,
      );

      await trx.commit();

      sendInvoiceEmail(
        negosiasi.investor.email,
        negosiasi.investor.nama,
        invoice,
        negosiasi,
      ).catch((err) => logger.error("Failed to send invoice email", { err }));

      const umkmUserDeal = await knex("users")
        .where({ id: negosiasi.bisnis_owner.id })
        .select("email", "nama")
        .first();

      const dealPayload = {
        bisnis_nama: negosiasi.bisnis?.nama,
        penawaran_nominal: lastLog.penawaran_nominal,
        penawaran_return: lastLog.penawaran_return,
        negosiasi_id,
      };

      sendNegotiationDealEmail(
        negosiasi.investor.email,
        negosiasi.investor.nama,
        dealPayload,
      ).catch((err) =>
        logger.error("Failed to send deal email to investor", { err }),
      );

      if (umkmUserDeal?.email) {
        sendNegotiationDealEmail(
          umkmUserDeal.email,
          umkmUserDeal.nama,
          dealPayload,
        ).catch((err) =>
          logger.error("Failed to send deal email to umkm", { err }),
        );
      }

      await notificationHelper.notifyReplyNegotiation(
        role_name === "investor"
          ? negosiasi.bisnis_owner.id
          : negosiasi.investor.id,
        negosiasi_id,
        "deal",
        catatan,
      );

      return responseHelper.success(res, "Negotiation accepted successfully", {
        negosiasi: await Negosiasis.getNegosiasiById(negosiasi_id),
        invoice: await invoices.getInvoiceById(invoice.id),
      });
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while accepting negosiasi", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while accepting negosiasi",
      );
    }
  }

  async rejectNegotiation(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: negosiasi_id } = req.params;
      const { catatan } = req.body;
      const { id: user_id, role_name } = req.user;

      const negosiasi = await Negosiasis.getNegosiasiById(negosiasi_id, trx);
      if (!negosiasi || negosiasi.status !== "active") {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Negosiasi not found or not active",
          404,
        );
      }

      const { error } = NegotiationValidator.acceptRejectNegotiationValidation({
        catatan,
      });
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      await Negosiasis.updateNegosiasi(negosiasi_id, "rejected", user_id, trx);

      await trx("pengajuans").where({ id: negosiasi.pengajuan.id }).update({
        status: "published",
        locked_by_investor_id: null,
        locked_at: null,
      });

      await trx.commit();

      let rejectedPenerimaEmail, rejectedPenerimaNama;
      if (role_name === "investor") {
        rejectedPenerimaEmail = negosiasi.bisnis_owner.email;
        rejectedPenerimaNama = negosiasi.bisnis_owner.nama;
      } else {
        rejectedPenerimaEmail = negosiasi.investor.email;
        rejectedPenerimaNama = negosiasi.investor.nama;
      }

      if (rejectedPenerimaEmail) {
        sendNegotiationRejectedEmail(
          rejectedPenerimaEmail,
          rejectedPenerimaNama,
          {
            bisnis_nama: negosiasi.bisnis?.nama,
            catatan,
            negosiasi_id,
          },
        ).catch((err) =>
          logger.error("Failed to send rejection email", { err }),
        );
      }

      await notificationHelper.notifyReplyNegotiation(
        role_name === "investor"
          ? negosiasi.bisnis_owner.id
          : negosiasi.investor.id,
        negosiasi_id,
        "rejected",
        catatan,
      );

      return responseHelper.success(res, "Negotiation rejected successfully");
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while rejecting negosiasi", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while rejecting negosiasi",
      );
    }
  }
}

module.exports = NegotiationController;
