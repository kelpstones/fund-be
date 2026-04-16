const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const BisnisRoutes = require("./bisnisRoutes");
const { Auth, Role } = require("../middlewares");
const KelasRoutes = require("./kelasRoute");
class UserRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.bisnisRoutes = new BisnisRoutes();
    this.kelasRoutes = new KelasRoutes();
  }
  routes() {
    this.router.post("/register", (req, res) => {
      this.authController.register(req, res);
    });
    this.router.post("/login", (req, res) => {
      this.authController.login(req, res);
    });

    this.router.use(Auth.verifyAnyToken);
    this.router.post("/me", Role.authorize("umkm", "investor"), (req, res) => {
      this.authController.authMe(req, res);
    });

    // bisnis
    this.router.use("/bisnis", this.bisnisRoutes.routes());

   
    return this.router;
  }
}

module.exports = UserRoutes;
