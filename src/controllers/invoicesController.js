const knex = require("../config/db");
const investasi = require("../models/investasi");
const Invoice = require("../models/invoices");
const pengajuans = require("../models/pengajuans");
const Transaksi = require("../models/transaksis");
const { ResponseHelper } = require("../utils/index");
const { invoiceValidation } = require("../validation/invoices");
const logger = require("../utils/index").logger;
class InvoicesController {
  async getAllInvoices(req, res) {
    try {
      const { page = 1, limit = 10, startDate, endDate, status } = req.query;
      const invoices = await Invoice.getAllInvoices(
        page,
        limit,
        startDate,
        endDate,
        status,
      );
      return ResponseHelper.withPagination(
        res,
        "Invoices fetched successfully",
        invoices,
        {
          page,
          limit,
          totalItems: invoices.length,
          startDate,
          endDate,
          status,
        },
      );
    } catch (error) {
      logger.error("An error occurred while fetching invoices", { error });
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching invoices",
      );
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.getInvoiceById(id);
      if (!invoice) {
        return ResponseHelper.error(res, "Invoice not found", 404);
      }

      const isAdmin = ["admin", "superadmin"].includes(req.user.role_name);
      const isOwner =
        invoice.investor?.id === req.user.id ||
        invoice.detail_pengajuan?.id_pemilik === req.user.id;

      if (!isAdmin && !isOwner) {
        return ResponseHelper.forbidden(res, "Access forbidden");
      }

      return ResponseHelper.success(
        res,
        "Invoice fetched successfully",
        invoice,
      );
    } catch (error) {
      logger.error("An error occurred while fetching the invoice", { error });
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching the invoice",
      );
    }
  }

  async getInvoicesByInvestors(req, res) {
    try {
      const { id: investor_id } = req.user;
      const { page = 1, limit = 10, startDate, endDate, status } = req.query;
      const invoices = await Invoice.getInvoicesByInvestor(
        investor_id,
        page,
        limit,
        status,
        startDate,
        endDate,
      );
      return ResponseHelper.withPagination(
        res,
        "Invoices fetched successfully",
        invoices,
        {
          page,
          limit,
          totalItems: invoices.length,
          status,
          startDate,
          endDate,
        },
      );
    } catch (error) {
      logger.error("An error occurred while fetching invoices", { error });
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching invoices",
      );
    }
  }

  async payInvoice(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: kode_pembayaran } = req.params;
      await trx("invoices")
        .where({ kode_pembayaran })
        .forUpdate()
        .first();

      const invoice = await Invoice.getInvoiceByKodePembayaran(
        kode_pembayaran,
        trx,
      );
      if (!invoice) {
        await trx.rollback();
        return ResponseHelper.error(res, "Invoice not found", 404);
      }
      if (invoice.status !== "pending") {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Only pending invoices can be paid",
          400,
        );
      }

      console.log("Processing payment for invoice:", invoice);
      const updatedInvoice = await Invoice.updateStatus(
        invoice.id,
        "paid",
        trx,
      );
      await investasi.createInvestasi(
        {
          investor_id: invoice.investor.id,
          pengajuans_id: invoice.detail_pengajuan.id,
          negosiasi_id: invoice.detail_pengajuan.id_negosiasi,
          nominal_investasi: invoice.nominal_tagihan,
          return_investasi: invoice.detail_pengajuan.per_annual,
        },
        trx,
      );

      await trx("pengajuans")
        .where({ id: invoice.detail_pengajuan.id })
        .forUpdate()
        .first();

      const pengajuan = await pengajuans.getPengajuanById(
        invoice.detail_pengajuan.id,
        trx,
      );

      const totalDanaBaru =
        Number(pengajuan.total_pendanaan) + Number(invoice.nominal_tagihan);

      let statusBaru = pengajuan.status;
      if (totalDanaBaru >= pengajuan.target_pendanaan) {
        statusBaru = "funded";
      }

      await pengajuans.updatePengajuan(
        invoice.detail_pengajuan.id,
        pengajuan.target_pendanaan,
        totalDanaBaru,
        pengajuan.per_anual_return,
        statusBaru,
        pengajuan.deskripsi_peluang,
        pengajuan.rencana_penggunaan_dana,
        trx,
      );

      const external_id = `invest-${invoice.kode_pembayaran}`;
      await Transaksi.createTransaksi(
        {
          user_id: invoice.investor.id,
          external_id,
          tipe: "investasi",
          jumlah: invoice.total_nominal,
          status: "completed",
          deskripsi: `Manual Payment Investasi untuk bisnis: ${invoice.detail_pengajuan.nama_bisnis}`,
        },
        trx,
      );

      await trx.commit();

      const data = {
        invoice: updatedInvoice,
        pengajuan: {
          id: pengajuan.id,
          total_pendanaan: totalDanaBaru,
          status: statusBaru,
        },
      };
      logger.info("Invoice paid successfully", { invoiceId: invoice.id, data });
      return ResponseHelper.success(res, "Invoice paid successfully", data);
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while processing the payment", { error });
      return ResponseHelper.serverError(
        res,
        "An error occurred while processing the payment",
      );
    }
  }
}

module.exports = InvoicesController;
