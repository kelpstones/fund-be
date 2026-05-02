const express = require("express");
const BisnisController = require("../controllers/bisnisController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
const KelasRoutes = require("./kelasRoutes");
const PengajuanRoutes = require("./pengajuanRoutes");
const BisnisProfileController = require("../controllers/bisnisProfileController");
class BisnisRoutes {
  constructor() {
    this.router = express.Router();
    this.bisnisController = new BisnisController();
    this.pengajuanRoutes = new PengajuanRoutes();
    this.kelasRoutes = new KelasRoutes();
    this.bisnisProfileController = new BisnisProfileController();
  }

  routes() {
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

    this.router.get(
      "/:id",
      Role.authorize("umkm", "superadmin", "admin"),
      (req, res) => {
        this.bisnisController.getBisnisById(req, res);
      },
    );

    this.router.put("/:id", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.updateBisnis(req, res);
    });

    this.router.delete(
      "/:id",
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

    this.router.put("/:id/profile/class", Role.authorize("umkm"), (req, res) => {
      this.bisnisProfileController.updateClass(req, res);
    });
    return this.router;
  }
}

module.exports = BisnisRoutes;
