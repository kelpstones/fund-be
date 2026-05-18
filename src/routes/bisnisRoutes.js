const express = require("express");
const BisnisController = require("../controllers/bisnisController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
const KelasRoutes = require("./kelasRoutes");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const PengajuanRoutes = require("./pengajuanRoutes");
const BisnisProfileController = require("../controllers/bisnisProfileController");
const BisnisDokumenController = require("../controllers/dokumenBisnisController");
class BisnisRoutes {
  constructor() {
    this.router = express.Router();
    this.bisnisController = new BisnisController();
    this.pengajuanRoutes = new PengajuanRoutes();
    this.kelasRoutes = new KelasRoutes();
    this.bisnisProfileController = new BisnisProfileController();
    this.bisnisDokumenController = new BisnisDokumenController();
  }

  routes() {
    // khusus ML
    this.router.get("/ml", (req, res) => {
      this.bisnisProfileController.getAllProfilesForML(req, res);
    });

    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.bisnisController.getBisnis(req, res);
      },
    );

    // pengajuan routes
    this.router.use("/proposals", this.pengajuanRoutes.routes());

    // kelas
    this.router.use("/classes", this.kelasRoutes.routes());

    this.router.get("/user", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.getBisnisByUserId(req, res);
    });

    this.router.post("/", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.createBisnis(req, res);
    });

    // dokumen for UMKM
    this.router.get("/documents", Role.authorize("umkm"), (req, res) => {
      this.bisnisDokumenController.getDokumenSaya(req, res);
    });

    this.router.post(
      "/documents",
      Role.authorize("umkm"),
      upload.single("file"),
      (req, res) => {
        this.bisnisDokumenController.uploadDokumen(req, res);
      },
    );

    // dokumen for ADMIN
    this.router.get(
      "/documents/pending",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.bisnisDokumenController.getDokumenPending(req, res);
      },
    );

    this.router.patch(
      "/documents/:id/review",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.bisnisDokumenController.reviewDokumen(req, res);
      },
    );

    this.router.patch(
      "/documents/:bisnis_id/verify",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.bisnisDokumenController.verifikasiBisnis(req, res);
      },
    );

    this.router.get(
      "/documents/:id",
      Role.authorize("umkm", "superadmin", "admin"),
      (req, res) => {
        this.bisnisController.getBisnisById(req, res);
      },
    );

    this.router.put("/documents/:id", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.updateBisnis(req, res);
    });

    this.router.delete(
      "/documents/:id",
      Role.authorize("umkm", "superadmin"),
      (req, res) => {
        this.bisnisController.deleteBisnis(req, res);
      },
    );

    // bisnis profile routes
    this.router.post("/:id/profile", Role.authorize("umkm"), (req, res) => {
      this.bisnisProfileController.upsertProfile(req, res);
    });

    this.router.get(
      "/:id/profile",
      Role.authorize("umkm", "superadmin", "admin"),
      (req, res) => {
        this.bisnisProfileController.getProfile(req, res);
      },
    );

    return this.router;
  }
}

module.exports = BisnisRoutes;
