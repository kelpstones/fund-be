const express = require("express");
const PengajuanController = require("../controllers/pengajuanController");
const NegotiationRoutes = require("./negotiationRoutes");
const { Auth, Role } = require("../middlewares");

class PengajuanRoutes {
  constructor() {
    this.router = express.Router();
    this.pengajuanController = new PengajuanController();
    this.negotiationRoutes = new NegotiationRoutes();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.getAllPengajuan(req, res);
      },
    );

    // negotiation routes
    this.router.use("/negosiasi", this.negotiationRoutes.routes());

    this.router.post("/:bisnis_id", Role.authorize("umkm"), (req, res) => {
      this.pengajuanController.createPengajuan(req, res);
    });

    this.router.get(
      "/:bisnis_id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.getPengajuanByBisnisId(req, res);
      },
    );

    this.router.put(
      "/:id",
      Role.authorize("umkm", "superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.updatePengajuan(req, res);
      },
    );

    this.router.put(
      "/:id/status",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.updateApprovalStatus(req, res);
      },
    );

    this.router.delete(
      "/:id",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.deletePengajuan(req, res);
      },
    );

    return this.router;
  }
}

module.exports = PengajuanRoutes;
