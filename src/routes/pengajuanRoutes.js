const express = require("express");
const PengajuanController = require("../controllers/pengajuanController");
const { Auth, Role } = require("../middlewares");

class PengajuanRoutes {
  constructor() {
    this.router = express.Router();
    this.pengajuanController = new PengajuanController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.get("/", Role.authorize("umkm", "investor"), (req, res) => {
      this.pengajuanController.getAllPengajuan(req, res);
    });

    this.router.post("/:bisnis_id", Role.authorize("umkm"), (req, res) => {
      this.pengajuanController.createPengajuan(req, res);
    });

    this.router.get("/:bisnis_id", Role.authorize("umkm", "investor"), (req, res) => {
      this.pengajuanController.getPengajuanByBisnisId(req, res);
    });

    this.router.put("/:id", Role.authorize("umkm"), (req, res) => {
      this.pengajuanController.updatePengajuan(req, res);
    });

    this.router.delete("/:id", Role.authorize("umkm", "superadmin"), (req, res) => {
      this.pengajuanController.deletePengajuan(req, res);
    });

    return this.router;
  }
}

module.exports = PengajuanRoutes;
