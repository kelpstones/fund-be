const Invoice = require("../models/invoices");
const { ResponseHelper } = require("../utils/index");
const { invoiceValidation } = require("../validation/invoices");

class InvoicesController {
  async getAllInvoices(req, res) {
    try {
      const { page, limit, startDate, endDate, status } = req.query;
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
        { page, limit, startDate, endDate, status },
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
      return ResponseHelper.success(
        res,
        "Invoice fetched successfully",
        invoice,
      );
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
      const { page, limit, startDate, endDate, status } = req.query;
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
        { page, limit, status, startDate, endDate },
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
      const { id } = req.params;
      const invoice = await Invoice.getInvoiceById(id);
      if (!invoice) {
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
    
      const updatedInvoice = await Invoice.updateStatus(id, "paid");
      return ResponseHelper.success(
        res,
        "Invoice paid successfully",
        updatedInvoice,
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
