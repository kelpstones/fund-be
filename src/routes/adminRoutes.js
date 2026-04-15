const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
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

    this.router.use(Auth.verifyAnyToken);
    this.router.post(
      "/me",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.authController.authMeAdmin(req, res);
      },
    );

    return this.router;
  }
}

module.exports = AdminRoutes;
