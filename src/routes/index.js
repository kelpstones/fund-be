const express = require("express");
const response = require("../utils/index").ResponseHelper;
const router = express.Router();
const UserRoutes = require("./userRoutes");
const AdminRoutes = require("./adminRoutes");
const BisnisRoutes = require("./bisnisRoutes");
const NotificationsRoutes = require("./notificationsRoutes");
const InvoicesRoutes = require("./invoicesRoutes");
const InvestasiRoutes = require("./investasiRoutes");
class Routes {
  constructor() {
    this.router = router;
    this.userRoutes = new UserRoutes();
    this.adminRoutes = new AdminRoutes();
    this.bisnisRoutes = new BisnisRoutes();
    this.notificationRoutes = new NotificationsRoutes();
    this.invoicesRoutes = new InvoicesRoutes();
    this.investasiRoutes = new InvestasiRoutes();
  }

  routes() {
    this.router.use("/bisnis", this.bisnisRoutes.routes());
    this.router.use("/user", this.userRoutes.routes());
    this.router.use("/investasi", this.investasiRoutes.routes());
    this.router.use("/notifications", this.notificationRoutes.routes());
    this.router.use("/invoices", this.invoicesRoutes.routes());
    this.router.use("/admin", this.adminRoutes.routes());


    this.router.get("/", (req, res) => {
      response.success(res, "Welcome to Fund API");
    });

    return this.router;
  }
}

module.exports = Routes;
