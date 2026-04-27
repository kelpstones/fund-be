const express = require("express");
const DashboardController = require("../controllers/dashboardController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");

class DashboardRoutes {
  constructor() {
    this.router = express.Router();
    this.dashboardController = new DashboardController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get("/umkm", Role.authorize("umkm"), (req, res) => {
      this.dashboardController.getBisnisDashboard(req, res);
    });

    this.router.get("/investor", Role.authorize("investor"), (req, res) => {
      this.dashboardController.getInvestorDashboard(req, res);
    });

    this.router.get(
      "/admin",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.dashboardController.getAdminDashboard(req, res);
      },
    );

    return this.router;
  }
}

module.exports = DashboardRoutes;