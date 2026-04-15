const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const { Auth } = require("../middlewares");

class AdminRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
  }

  routes() {
    this.router.post("/login", (req, res) => {
      this.authController.loginAdmin(req, res);
    });

    this.router.use(Auth.verifyAdminToken);
    this.router.post("/me", (req, res) => {
      this.authController.authMeAdmin(req, res);
    });

    return this.router;
  }
}

module.exports = AdminRoutes;