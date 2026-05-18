const express = require("express");
const DokumenBisnisController = require("../controllers/dokumenBisnisController");
const { Auth, Role } = require("../middlewares");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

class DokumenBisnisRoutes {
  constructor() {
    this.router = express.Router();
    this.controller = new DokumenBisnisController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    // UMKM
    this.router.get("/", Role.authorize("umkm"), (req, res) => {
      this.controller.getDokumenSaya(req, res);
    });

    this.router.post(
      "/",
      Role.authorize("umkm"),
      upload.array("files", 10),
      (req, res) => {
        this.controller.uploadDokumen(req, res);
      },
    );

    // ADMIN
    this.router.get(
      "/pending",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.controller.getDokumenPending(req, res);
      },
    );

    this.router.patch(
      "/:id/review",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.controller.reviewDokumen(req, res);
      },
    );

    this.router.patch(
      "/:bisnis_id/verify",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.controller.verifikasiBisnis(req, res);
      },
    );

    return this.router;
  }
}

module.exports = DokumenBisnisRoutes;