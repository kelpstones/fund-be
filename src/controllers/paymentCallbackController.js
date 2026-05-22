const knex = require("../config/db");
const Transaksi = require("../models/transaksis");
const User = require("../models/users");
const Invoice = require("../models/invoices");
const investasi = require("../models/investasi");
const pengajuans = require("../models/pengajuans");
const { ResponseHelper } = require("../utils/index");
const logger = require("../utils/index").logger;
const { sendTopUpSuccessEmail } = require("../utils/mailer");

class PaymentCallbackController {
  async xenditCallback(req, res) {
    const trx = await knex.transaction();
    try {
      const callbackToken = req.headers["x-callback-token"];
      const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;

      if (expectedToken && callbackToken !== expectedToken) {
        logger.warn("Unauthorized Xendit callback token received", {
          received: callbackToken,
        });
        await trx.rollback();
        return ResponseHelper.forbidden(res, "Invalid callback token");
      }

      const { external_id, status, amount } = req.body || {};
      logger.info("Received Xendit callback notification", { external_id, status, amount });

      if (!external_id || typeof external_id !== "string") {
        await trx.rollback();
        return ResponseHelper.error(res, "external_id is required and must be a string", 400);
      }

      if (status !== "PAID") {
        await trx.rollback();
        return ResponseHelper.success(res, "Callback received but status is not PAID");
      }

      if (external_id.startsWith("topup-")) {
        const transaksi = await Transaksi.getTransaksiByExternalId(external_id, trx);
        if (!transaksi) {
          logger.warn("Transaction not found for top-up callback", { external_id });
          await trx.rollback();
          return ResponseHelper.error(res, "Transaction not found", 404);
        }

        if (transaksi.status === "completed") {
          await trx.rollback();
          return ResponseHelper.success(res, "Transaction is already completed");
        }

        await Transaksi.updateStatus(transaksi.id, "completed", trx);

        const user = await User.getUserById(transaksi.user_id, trx);
        const updatedSaldo = parseFloat(user.saldo) + parseFloat(transaksi.jumlah);
        await User.updateUser(transaksi.user_id, { saldo: updatedSaldo }, trx);

        await trx.commit();
        logger.info("Top-up transaction completed via Xendit callback", {
          external_id,
          userId: user.id,
          newSaldo: updatedSaldo,
        });

        if (user.email) {
          sendTopUpSuccessEmail(user.email, user.nama, {
            nominal: transaksi.jumlah,
            saldoSaatIni: updatedSaldo,
            externalId: external_id,
            tanggal: new Date(),
          }).catch((emailErr) => {
            logger.error("Failed to send top up success email", { error: emailErr });
          });
        }

        return ResponseHelper.success(res, "Callback processed successfully (Top-up completed)");
      }

      if (external_id.startsWith("invoice-")) {
        const kodePembayaran = external_id.replace("invoice-", "");
        const invoice = await Invoice.getInvoiceByKodePembayaran(kodePembayaran, trx);
        if (!invoice) {
          logger.warn("Invoice not found for callback", { external_id });
          await trx.rollback();
          return ResponseHelper.error(res, "Invoice not found", 404);
        }

        if (invoice.status !== "pending") {
          await trx.rollback();
          return ResponseHelper.success(res, "Invoice is already processed");
        }

        const updatedInvoice = await Invoice.updateStatus(invoice.id, "paid", trx);

        await investasi.createInvestasi(
          {
            investor_id: invoice.investor.id,
            pengajuans_id: invoice.detail_pengajuan.id,
            negosiasi_id: invoice.detail_pengajuan.id_negosiasi,
            nominal_investasi: invoice.nominal_tagihan,
            return_investasi: invoice.detail_pengajuan.per_annual,
          },
          trx
        );

        const pengajuan = await pengajuans.getPengajuanById(
          invoice.detail_pengajuan.id,
          trx
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
          trx
        );

        await Transaksi.createTransaksi(
          {
            user_id: invoice.investor.id,
            external_id: external_id,
            tipe: "investasi",
            jumlah: invoice.total_nominal,
            status: "completed",
            deskripsi: `Direct Payment Investasi via Xendit untuk bisnis: ${invoice.detail_pengajuan.nama_bisnis}`,
          },
          trx
        );

        await trx.commit();
        logger.info("Direct Invoice Payment completed via Xendit callback", {
          external_id,
          invoiceId: invoice.id,
        });
        return ResponseHelper.success(res, "Callback processed successfully (Direct payment completed)");
      }

      await trx.rollback();
      return ResponseHelper.error(res, "Unknown external_id format", 400);
    } catch (err) {
      await trx.rollback();
      logger.error("Error in Xendit callback handler", { error: err });
      return ResponseHelper.serverError(res, "An error occurred while processing callback");
    }
  }
}

module.exports = PaymentCallbackController;
