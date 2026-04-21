const express = require("express");
const router = express.Router();
const { invoiceValidation } = require("../validation/invoices");
const { Auth, Role } = require("../middlewares");
const InvoicesController = require("../controllers/invoicesController");
class InvoicesRoutes {
  constructor() {
    this.router = router;
    this.invoicesController = new InvoicesController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.get(
      "/",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.invoicesController.getAllInvoices(req, res);
      },
    );

    this.router.get("/investor", Role.authorize("investor"), (req, res) => {
      this.invoicesController.getInvoicesByInvestors(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("admin", "superadmin", "investor", "umkm"),
      (req, res) => {
        this.invoicesController.getInvoiceById(req, res);
      },
    );
    this.router.put("/:id/pay", Role.authorize("investor"), (req, res) => {
      this.invoicesController.payInvoice(req, res);
    });

    return this.router;
  }
}

module.exports = InvoicesRoutes;
