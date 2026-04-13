const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const BisnisRoutes = require("./bisnisRoutes");
class UserRoutes {
  constructor() {
    this.router = router;
  }
  routes() {
    this.router.post("/register", (req, res) => {
      const authController = new AuthController();
      authController.register(req, res);
    });
    this.router.post("/login", (req, res) => {
      const authController = new AuthController();
      authController.login(req, res);
    });

    // bisnis
    this.router.use("/bisnis", new BisnisRoutes().routes());
    return this.router;
  }
}

module.exports = UserRoutes;
