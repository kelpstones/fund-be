const express = require("express");
const PengajuanController = require("../controllers/pengajuanController");
const NegotiationRoutes = require("./negotiationRoutes");
const PenjualanRoutes = require("./penjualanRoutes");
const { Auth, Role, BisnisProfile } = require("../middlewares");
class PengajuanRoutes {
  constructor() {
    this.router = express.Router({ mergeParams: true });
    this.pengajuanController = new PengajuanController();
    this.negotiationRoutes = new NegotiationRoutes();
    this.penjualanRoutes = new PenjualanRoutes();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    // negotiation routes
    this.router.use("/negotiations", this.negotiationRoutes.routes());

    // penjualan routes
    this.router.use("/sales", this.penjualanRoutes.routes());

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.pengajuanController.getAllPengajuan(req, res);
      },
    );

    this.router.post(
      "/",
      Role.authorize("umkm"),
      BisnisProfile.RequireBisnisProfile,
      (req, res) => {
        this.pengajuanController.createPengajuan(req, res);
      },
    );

    this.router.get(
      "/",
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
