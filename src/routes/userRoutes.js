const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const BisnisRoutes = require("./bisnisRoutes");
const { Auth } = require("../middlewares");

class UserRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.bisnisRoutes = new BisnisRoutes();
  }
  routes() {
    this.router.post("/register", (req, res) => {
      this.authController.register(req, res);
    });
    this.router.post("/login", (req, res) => {
      this.authController.login(req, res);
    });

    this.router.use(Auth.verifyToken);
    this.router.post("/me", (req, res) => {
      this.authController.authMe(req, res);
    });

    // bisnis
    this.router.use("/bisnis", this.bisnisRoutes.routes());
    return this.router;
  }
}

module.exports = UserRoutes;
