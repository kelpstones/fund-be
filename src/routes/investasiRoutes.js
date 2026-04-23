const express = require("express");
const InvestasiController = require("../controllers/investasiController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");

class InvestasiRoutes {
  constructor() {
    this.router = express.Router();
    this.investasiController = new InvestasiController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get("/", Role.authorize("superadmin", "admin"), (req, res) => {
      this.investasiController.getAllInvestasi(req, res);
    });

    this.router.get("/investor", Role.authorize("investor"), (req, res) => {
      this.investasiController.getInvestasiByInvestorId(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.investasiController.getInvestasiById(req, res);
      },
    );

    this.router.get(
      "/pengajuan/:pengajuans_id",
      Role.authorize("superadmin", "admin", "umkm"),
      (req, res) => {
        this.investasiController.getInvestasiByPengajuanId(req, res);
      },
    );
    return this.router;
  }
}

module.exports = InvestasiRoutes;
