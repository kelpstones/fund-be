const express = require("express");
const BisnisController = require("../controllers/bisnisController");
const { Auth } = require("../middlewares");
const { BisnisValidator } = require("../validation");
const PengajuanRoutes = require("./pengajuanRoutes");
class BisnisRoutes {
  constructor() {
    this.router = express.Router();
    this.bisnisController = new BisnisController();
    this.pengajuanRoutes = new PengajuanRoutes();
  }

  routes() {
    this.router.use(Auth.verifyToken);
    this.router.use(BisnisValidator.bisnisTokenValidation);
    this.router.get("/", (req, res) => {
      this.bisnisController.getBisnis(req, res);
    });

    // pengajuan routes
    this.router.use("/pengajuan", this.pengajuanRoutes.routes());

    this.router.post("/", (req, res) => {
      this.bisnisController.createBisnis(req, res);
    });

    this.router.get("/:id", (req, res) => {
      this.bisnisController.getBisnisById(req, res);
    });
    this.router.get("/user", (req, res) => {
      this.bisnisController.getBisnisByUserId(req, res);
    });
    this.router.put("/:id", (req, res) => {
      this.bisnisController.updateBisnis(req, res);
    });
    this.router.delete("/:id", (req, res) => {
      this.bisnisController.deleteBisnis(req, res);
    });

    return this.router;
  }
}

module.exports = BisnisRoutes;
