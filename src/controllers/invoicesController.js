const Invoice = require("../models/invoices");
const { ResponseHelper } = require("../utils/index");
const { invoiceValidation } = require("../validation/invoices");

class InvoicesController {
  async createInvoice(req, res) {
    try {
      const { id: id_investor } = req.user;
      const {
        id_negosiasi,
        id_pengajuan,
        nominal_tagihan,
        status,
      } = req.body;
      
      const validate = invoiceValidation({
        id_negosiasi,
        id_pengajuan,
        id_investor,
        nominal_tagihan,
        status,
      });
      if (validate.error) {
        return ResponseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const invoice = await Invoice.createInvoice(
        id_negosiasi,
        id_pengajuan,
        id_investor,
        nominal_tagihan,
        status,
      );
      return ResponseHelper.created(
        res,
        "Invoice created successfully",
        invoice,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while creating the invoice",
      );
    }
  }
}
