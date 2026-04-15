const express = require("express");
const response = require("../utils/response");
const router = express.Router();
const UserRoutes = require("./userRoutes");
const AdminRoutes = require("./adminRoutes");
class Routes {
  constructor() {
    this.router = router;
    this.userRoutes = new UserRoutes();
    this.adminRoutes = new AdminRoutes();
  }

  routes() {
    this.router.use("/user", this.userRoutes.routes());
    this.router.use("/admin", this.adminRoutes.routes());
    this.router.get("/", (req, res) => {
      response.success(res, "Welcome to Fund API");
    });

    return this.router;
  }
}

module.exports = Routes;
