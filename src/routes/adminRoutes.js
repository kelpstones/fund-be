const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const { Auth } = require("../middlewares");
const PengajuanController = require("../controllers/pengajuanController");
const BisnisController = require("../controllers/bisnisController");

class AdminRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.bisnisController = new BisnisController();
    this.pengajuanController = new PengajuanController();
  }

  routes() {
    this.router.post("/login", (req, res) => {
      this.authController.loginAdmin(req, res);
    });

    this.router.use(Auth.verifyAdminToken);
    this.router.post("/me", (req, res) => {
      this.authController.authMeAdmin(req, res);
    });

    this.router.get("/bisnis", (req, res) => {
        this.bisnisController.getBisnis(req, res);
    })

    this.router.get("/pengajuan", (req, res) => {
      this.pengajuanController.getAllPengajuan(req, res);
    });

    this.router.delete("/pengajuan/:id", (req, res) => {
      this.pengajuanController.deletePengajuan(req, res);
    });

    return this.router;
  }
}

module.exports = AdminRoutes;
