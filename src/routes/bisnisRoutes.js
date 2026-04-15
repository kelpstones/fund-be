const express = require("express");
const BisnisController = require("../controllers/bisnisController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");

const PengajuanRoutes = require("./pengajuanRoutes");
class BisnisRoutes {
  constructor() {
    this.router = express.Router();
    this.bisnisController = new BisnisController();
    this.pengajuanRoutes = new PengajuanRoutes();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get("/", (req, res) => {
      this.bisnisController.getBisnis(req, res);
    });

    // pengajuan routes
    this.router.use("/pengajuan", this.pengajuanRoutes.routes());

    this.router.post("/", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.createBisnis(req, res);
    });

    this.router.get("/:id", Role.authorize("umkm", "superadmin", "admin"), (req, res) => {
      this.bisnisController.getBisnisById(req, res);
    });
    this.router.get("/user", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.getBisnisByUserId(req, res);
    });
    this.router.put("/:id", Role.authorize("umkm"), (req, res) => {
      this.bisnisController.updateBisnis(req, res);
    });
    this.router.delete("/:id", Role.authorize("umkm", "superadmin"), (req, res) => {
      this.bisnisController.deleteBisnis(req, res);
    });

    return this.router;
  }
}

module.exports = BisnisRoutes;
