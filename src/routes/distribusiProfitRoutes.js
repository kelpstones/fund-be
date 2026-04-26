const express = require("express");
const DistribusiProfitController = require("../controllers/distribusiProfitController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");

class DistribusiProfitRoutes {
  constructor() {
    this.router = express.Router();
    this.distribusiProfitController = new DistribusiProfitController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("investor", "superadmin", "admin"),
      (req, res) => {
        this.distribusiProfitController.getAllDistribusiProfits(req, res);
      },
    );

    this.router.get("/investor", Role.authorize("investor"), (req, res) => {
      this.distribusiProfitController.getByInvestor(req, res);
    });

    this.router.get(
      "/penjualan/:penjualans_id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.distribusiProfitController.getByPenjualanId(req, res);
      },
    );

    this.router.get(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.distribusiProfitController.getById(req, res);
      },
    );

    this.router.put(
      "/:id/status",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.distribusiProfitController.updateStatus(req, res);
      },
    );

    return this.router;
  }
}

module.exports = DistribusiProfitRoutes;