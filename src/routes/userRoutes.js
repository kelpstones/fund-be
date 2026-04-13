const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const BisnisRoutes = require("./bisnisRoutes");
const verifyToken = require("../middlewares/auth");

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

    this.router.use(verifyToken);
    this.router.post("/me", (req, res) => {
      const authController = new AuthController();
      authController.authMe(req, res);
    });

    // bisnis
    this.router.use("/bisnis", new BisnisRoutes().routes());
    return this.router;
  }
}

module.exports = UserRoutes;
