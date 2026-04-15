const express = require("express");
const PengajuanController = require("../controllers/pengajuanController");
const verifyToken = require("../middlewares/auth");
const { PengajuanValidator } = require("../validation");

class PengajuanRoutes {
  constructor() {
    this.router = express.Router();
    this.pengajuanController = new PengajuanController();
  }

  routes() {
    this.router.get("/", (req, res) => {
      this.pengajuanController.getAllPengajuan(req, res);
    });

    this.router.post("/:bisnis_id", (req, res) => {
      this.pengajuanController.createPengajuan(req, res);
    });

    this.router.get("/:bisnis_id", (req, res) => {
      this.pengajuanController.getPengajuanByBisnisId(req, res);
    });

    this.router.put("/:id", (req, res) => {
      this.pengajuanController.updatePengajuan(req, res);
    });

    this.router.delete("/:id", (req, res) => {
      this.pengajuanController.deletePengajuan(req, res);
    });

    return this.router;
  }
}

module.exports = PengajuanRoutes;
