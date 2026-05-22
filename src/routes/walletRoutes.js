const express = require("express");
const WalletController = require("../controllers/walletController");
const PaymentCallbackController = require("../controllers/paymentCallbackController");
const { Auth, Role } = require("../middlewares");

class WalletRoutes {
  constructor() {
    this.router = express.Router();
    this.walletController = new WalletController();
    this.callbackController = new PaymentCallbackController();
  }

  routes() {
    
    this.router.post("/xendit-callback", (req, res) => {
      this.callbackController.xenditCallback(req, res);
    });

 
    this.router.use(Auth.verifyAnyToken);

    // Admin endpoints for withdrawals
    this.router.get(
      "/withdrawals",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.walletController.getAllWithdrawals(req, res);
      }
    );

    this.router.put(
      "/withdrawals/:id/status",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.walletController.updateWithdrawalStatus(req, res);
      }
    );

    this.router.use(Role.authorize("investor"));

    this.router.get("/dashboard", (req, res) => {
      this.walletController.getWalletDashboard(req, res);
    });

    this.router.post("/topup", (req, res) => {
      this.walletController.requestTopUp(req, res);
    });

    this.router.post("/withdraw", (req, res) => {
      this.walletController.requestWithdrawal(req, res);
    });

    this.router.post("/pay-invoice/:invoice_id", (req, res) => {
      this.walletController.payInvoiceViaWallet(req, res);
    });

    this.router.post("/mock-topup", (req, res) => {
      this.walletController.mockTopUp(req, res);
    });

    return this.router;
  }
}

module.exports = WalletRoutes;
