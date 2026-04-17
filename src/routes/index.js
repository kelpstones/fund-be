const express = require("express");
const response = require("../utils/response");
const router = express.Router();
const UserRoutes = require("./userRoutes");
const AdminRoutes = require("./adminRoutes");
const BisnisRoutes = require("./bisnisRoutes");
class Routes {
  constructor() {
    this.router = router;
    this.userRoutes = new UserRoutes();
    this.adminRoutes = new AdminRoutes();
    this.bisnisRoutes = new BisnisRoutes();
  }

  routes() {
    this.router.use("/bisnis", this.bisnisRoutes.routes());
    this.router.use("/user", this.userRoutes.routes());
    this.router.use("/admin", this.adminRoutes.routes());
    this.router.get("/", (req, res) => {
      response.success(res, "Welcome to Fund API");
    });

    return this.router;
  }
}

module.exports = Routes;
