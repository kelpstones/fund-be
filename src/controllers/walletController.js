const knex = require("../config/db");
const Transaksi = require("../models/transaksis");
const User = require("../models/users");
const Invoice = require("../models/invoices");
const investasi = require("../models/investasi");
const pengajuans = require("../models/pengajuans");
const xenditClient = require("../utils/xendit");
const { ResponseHelper } = require("../utils/index");
const { WalletValidator } = require("../validation/index");
const logger = require("../utils/index").logger;
const {
  sendTopUpPendingEmail,
  sendWithdrawalPendingEmail,
  sendWithdrawalSuccessEmail,
  sendWithdrawalFailedEmail,
} = require("../utils/mailer");

class WalletController {
  async requestTopUp(req, res) {
    try {
      const { error } = WalletValidator.topUpValidation(req.body);
      if (error) {
        return ResponseHelper.error(res, error.details[0].message, 400);
      }

      const { jumlah } = req.body || {};
      const { id: user_id, email, nama } = req.user;

      const external_id = `topup-${Date.now()}-${user_id}`;

      // Call Xendit API
      let invoice;
      try {
        invoice = await xenditClient.Invoice.createInvoice({
          data: {
            externalId: external_id,
            amount: parseFloat(jumlah),
            payerEmail: email,
            description: `Top Up Saldo Dompet Virtual - ${nama}`,
          },
        });
      } catch (xenditError) {
        logger.error("Xendit Invoice creation failed", { error: xenditError });
        return ResponseHelper.serverError(
          res,
          "Gagal membuat invoice ke Xendit",
        );
      }

      // Create pending transaction in database
      const trx = await Transaksi.createTransaksi({
        user_id,
        external_id,
        tipe: "deposit",
        jumlah,
        status: "pending",
        deskripsi: `Top Up Saldo via Xendit (${invoice.invoiceUrl || invoice.invoice_url})`,
      });

      if (email) {
        sendTopUpPendingEmail(email, nama, {
          nominal: jumlah,
          paymentUrl: invoice.invoiceUrl || invoice.invoice_url,
          externalId: external_id,
          tanggal: trx.created_at || new Date(),
        }).catch((emailErr) => {
          logger.error("Failed to send top up pending email", { error: emailErr });
        });
      }

      return ResponseHelper.success(
        res,
        "Top up request created successfully",
        {
          transaksi: trx,
          payment_url: invoice.invoiceUrl || invoice.invoice_url,
        },
      );
    } catch (err) {
      logger.error("Error in requestTopUp", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while requesting top up",
      );
    }
  }

  async requestWithdrawal(req, res) {
    const trx = await knex.transaction();
    try {
      const { error } = WalletValidator.withdrawValidation(req.body);
      if (error) {
        await trx.rollback();
        return ResponseHelper.error(res, error.details[0].message, 400);
      }

      const { jumlah, user_bank_account_id } = req.body || {};
      const { id: user_id } = req.user;

      let bankAccount;
      if (user_bank_account_id) {
        bankAccount = await trx("user_bank_accounts")
          .where({ id: user_bank_account_id, user_id })
          .first();
      } else {
        bankAccount = await trx("user_bank_accounts")
          .where({ user_id, is_primary: true })
          .first();
        if (!bankAccount) {
          bankAccount = await trx("user_bank_accounts")
            .where({ user_id })
            .first();
        }
      }

      if (!bankAccount) {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Silakan daftarkan rekening bank terlebih dahulu di profil Anda",
          400,
        );
      }

      const user = await trx("users").where({ id: user_id }).forUpdate().first();
      if (!user) {
        await trx.rollback();
        return ResponseHelper.error(res, "User not found", 404);
      }

      if (parseFloat(user.saldo) < parseFloat(jumlah)) {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Saldo tidak mencukupi untuk melakukan penarikan",
          400,
        );
      }

      const updatedSaldo = parseFloat(user.saldo) - parseFloat(jumlah);
      await trx("users").where({ id: user_id }).update({ saldo: updatedSaldo, updated_at: trx.fn.now() });

      const external_id = `withdraw-${Date.now()}-${user_id}`;

      const txn = await Transaksi.createTransaksi(
        {
          user_id,
          external_id,
          tipe: "penarikan",
          jumlah,
          status: "pending",
          deskripsi: `Penarikan saldo ke rekening ${bankAccount.name} (${bankAccount.bank_account_number}) a.n. ${bankAccount.bank_account_holder}`,
          bank_name: bankAccount.name,
          bank_account_number: bankAccount.bank_account_number,
          bank_account_holder: bankAccount.bank_account_holder,
        },
        trx,
      );

      await trx.commit();

      if (user.email) {
        sendWithdrawalPendingEmail(user.email, user.nama, {
          nominal: jumlah,
          externalId: external_id,
          tanggal: txn.created_at || new Date(),
        }).catch((emailErr) => {
          logger.error("Failed to send withdrawal pending email", { error: emailErr });
        });
      }

      return ResponseHelper.success(
        res,
        "Permintaan penarikan dana berhasil diajukan",
        {
          transaksi: txn,
          saldo_saat_ini: updatedSaldo,
        },
      );
    } catch (err) {
      await trx.rollback();
      logger.error("Error in requestWithdrawal", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while requesting withdrawal",
      );
    }
  }

  async payInvoiceViaWallet(req, res) {
    const trx = await knex.transaction();
    try {
      const { invoice_id } = req.params;
      const { id: user_id } = req.user;

      await trx("invoices")
        .modify((qb) => {
          if (isNaN(invoice_id)) {
            qb.where({ kode_pembayaran: invoice_id });
          } else {
            qb.where({ id: Number(invoice_id) });
          }
        })
        .forUpdate()
        .first();

      let invoice;
      if (isNaN(invoice_id)) {
        invoice = await Invoice.getInvoiceByKodePembayaran(invoice_id, trx);
      } else {
        invoice = await Invoice.getInvoiceById(Number(invoice_id), trx);
      }

      if (!invoice) {
        await trx.rollback();
        return ResponseHelper.error(res, "Invoice tidak ditemukan", 404);
      }

      if (invoice.investor.id !== user_id) {
        await trx.rollback();
        return ResponseHelper.forbidden(
          res,
          "Anda tidak memiliki akses untuk membayar invoice ini",
        );
      }

      if (invoice.status !== "pending") {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Hanya invoice pending yang dapat dibayar",
          400,
        );
      }

      const user = await trx("users").where({ id: user_id }).forUpdate().first();
      if (!user) {
        await trx.rollback();
        return ResponseHelper.error(res, "User tidak ditemukan", 404);
      }

      if (parseFloat(user.saldo) < parseFloat(invoice.total_nominal)) {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Saldo dompet virtual tidak mencukupi",
          400,
        );
      }

      const updatedSaldo =
        parseFloat(user.saldo) - parseFloat(invoice.total_nominal);
      await trx("users").where({ id: user_id }).update({ saldo: updatedSaldo, updated_at: trx.fn.now() });

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
      const txn = await Transaksi.createTransaksi(
        {
          user_id,
          external_id,
          tipe: "investasi",
          jumlah: invoice.total_nominal,
          status: "completed",
          deskripsi: `Investasi pada bisnis: ${invoice.detail_pengajuan.nama_bisnis}`,
        },
        trx,
      );

      await trx.commit();

      const data = {
        invoice: updatedInvoice,
        transaksi: txn,
        saldo_saat_ini: updatedSaldo,
        pengajuan: {
          id: pengajuan.id,
          total_pendanaan: totalDanaBaru,
          status: statusBaru,
        },
      };

      logger.info("Invoice paid successfully via wallet balance", {
        invoiceId: invoice.id,
        data,
      });
      return ResponseHelper.success(
        res,
        "Pembayaran invoice via saldo dompet virtual berhasil",
        data,
      );
    } catch (err) {
      await trx.rollback();
      logger.error("Error in payInvoiceViaWallet", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while paying invoice via wallet",
      );
    }
  }

  async getWalletDashboard(req, res) {
    try {
      const { id: user_id } = req.user;
      const { page = 1, limit = 10 } = req.query;

      const user = await User.getUserById(user_id);
      if (!user) {
        return ResponseHelper.error(res, "User not found", 404);
      }

      const transactions = await Transaksi.getTransaksisByUserId(
        user_id,
        page,
        limit,
      );

      return ResponseHelper.success(
        res,
        "Wallet dashboard fetched successfully",
        {
          saldo: user.saldo,
          ...transactions,
        },
      );
    } catch (err) {
      logger.error("Error in getWalletDashboard", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching wallet dashboard",
      );
    }
  }

  async mockTopUp(req, res) {
    const trx = await knex.transaction();
    try {
      if (process.env.NODE_ENV === "production") {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Feature not available in production",
          403,
        );
      }

      const { jumlah = 10000000 } = req.body || {};
      const { id: user_id } = req.user;

      const user = await User.getUserById(user_id, trx);
      if (!user) {
        await trx.rollback();
        return ResponseHelper.error(res, "User not found", 404);
      }

      const updatedSaldo = parseFloat(user.saldo) + parseFloat(jumlah);
      await User.updateUser(user_id, { saldo: updatedSaldo }, trx);

      const external_id = `mock-${Date.now()}-${user_id}`;
      const txn = await Transaksi.createTransaksi(
        {
          user_id,
          external_id,
          tipe: "deposit",
          jumlah,
          status: "completed",
          deskripsi: "Mock Top Up Saldo Dompet Virtual (Testing)",
        },
        trx,
      );

      await trx.commit();
      return ResponseHelper.success(res, "Mock top up successful", {
        transaksi: txn,
        saldo_saat_ini: updatedSaldo,
      });
    } catch (err) {
      await trx.rollback();
      logger.error("Error in mockTopUp", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred during mock top up",
      );
    }
  }

  async getAllWithdrawals(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const filters = {
        tipe: "penarikan",
      };
      if (status) {
        filters.status = status;
      }

      const withdrawals = await Transaksi.getAllTransaksis(
        filters,
        page,
        limit,
      );

      return ResponseHelper.withPagination(
        res,
        "Withdrawal requests fetched successfully",
        withdrawals.data,
        {
          page,
          limit,
          totalItems: withdrawals.pagination.total,
          status,
        },
      );
    } catch (err) {
      logger.error("Error in getAllWithdrawals", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching withdrawal requests",
      );
    }
  }

  async updateWithdrawalStatus(req, res) {
    const trx = await knex.transaction();
    try {
      const { id } = req.params;
      const { error } = WalletValidator.updateWithdrawalStatusValidation(
        req.body,
      );
      if (error) {
        await trx.rollback();
        return ResponseHelper.error(res, error.details[0].message, 400);
      }

      const { status } = req.body;

      const transaction = await trx("transaksis").where({ id }).forUpdate().first();
      if (!transaction) {
        await trx.rollback();
        return ResponseHelper.error(res, "Transaksi tidak ditemukan", 404);
      }

      if (transaction.tipe !== "penarikan") {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Transaksi ini bukan penarikan dana",
          400,
        );
      }

      if (transaction.status !== "pending") {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "Permintaan penarikan dana sudah diproses",
          400,
        );
      }

      const user = await trx("users").where({ id: transaction.user_id }).forUpdate().first();
      if (!user) {
        await trx.rollback();
        return ResponseHelper.error(
          res,
          "User pemilik transaksi tidak ditemukan",
          404,
        );
      }

      let updatedTransaction;
      if (status === "failed") {
        const refundedSaldo =
          parseFloat(user.saldo) + parseFloat(transaction.jumlah);
        await trx("users").where({ id: transaction.user_id }).update({ saldo: refundedSaldo, updated_at: trx.fn.now() });

        updatedTransaction = await Transaksi.updateStatus(id, "failed", trx);
      } else {
        updatedTransaction = await Transaksi.updateStatus(id, "completed", trx);
      }

      await trx.commit();

      if (user.email) {
        if (status === "completed") {
          sendWithdrawalSuccessEmail(user.email, user.nama, {
            nominal: transaction.jumlah,
            externalId: transaction.external_id,
            tanggal: updatedTransaction.updated_at || new Date(),
          }).catch((emailErr) => {
            logger.error("Failed to send withdrawal success email", { error: emailErr });
          });
        } else if (status === "failed") {
          const refundedSaldo =
            parseFloat(user.saldo) + parseFloat(transaction.jumlah);
          sendWithdrawalFailedEmail(user.email, user.nama, {
            nominal: transaction.jumlah,
            saldoSaatIni: refundedSaldo,
            externalId: transaction.external_id,
            tanggal: updatedTransaction.updated_at || new Date(),
            alasan: req.body.alasan || "Ditolak oleh Admin",
          }).catch((emailErr) => {
            logger.error("Failed to send withdrawal failed email", { error: emailErr });
          });
        }
      }

      return ResponseHelper.success(
        res,
        `Permintaan penarikan dana berhasil di-${status === "completed" ? "setujui" : "tolak"}`,
        {
          transaksi: updatedTransaction,
        },
      );
    } catch (err) {
      await trx.rollback();
      logger.error("Error in updateWithdrawalStatus", { error: err });
      return ResponseHelper.serverError(
        res,
        "An error occurred while updating withdrawal status",
      );
    }
  }
}

module.exports = WalletController;
