const knex = require("../config/db");
const investasi = require("../models/investasi");
const Invoice = require("../models/invoices");
const pengajuans = require("../models/pengajuans");
const { ResponseHelper } = require("../utils/index");
const { invoiceValidation } = require("../validation/invoices");

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
      console.error(error);
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
      return ResponseHelper.success(res, "Invoice fetched successfully");
    } catch (error) {
      console.error(error);
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
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching invoices",
      );
    }
  }

  async payInvoice(req, res) {
    try {
      const trx = await knex.transaction();
      const { id } = req.params;
      const invoice = await Invoice.getInvoiceById(id);
      if (!invoice) {
        await trx.rollback();
        return ResponseHelper.error(res, "Invoice not found", 404);
      }
      if (invoice.status !== "pending") {
        return ResponseHelper.error(
          res,
          "Only pending invoices can be paid",
          400,
        );
      }

      // await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedInvoice = await Invoice.updateStatus(id, "paid", trx);
      await investasi.createInvestasi({
        investor_id: invoice.investor.id,
        pengajuans_id: invoice.detail_pengajuan.id,
        negosiasi_id: invoice.detail_pengajuan.id_negosiasi,
        nominal_investasi: invoice.nominal_tagihan,
        return_investasi: invoice.detail_pengajuan.per_annual,
        trx,
      });
      // console.log("Updated Invoice:", updatedInvoice);

      const pengajuan = await pengajuans.getPengajuanById(
        invoice.detail_pengajuan.id,
      );
      console.log("Current Pengajuan:", pengajuan.total_pendanaan);

      const totalDanaBaru =
        Number(pengajuan.total_pendanaan) + Number(invoice.nominal_tagihan);
      console.log("Total Dana Baru:", totalDanaBaru);
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

      return ResponseHelper.success(
        res,
        "Invoice paid successfully",
        data,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while processing the payment",
      );
    }
  }
}

module.exports = InvoicesController;
