const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const { Auth, Role, RateLimiter } = require("../middlewares");
const AdminController = require("../controllers/adminController");
class AdminRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.adminController = new AdminController();
  }

  routes() {
    this.router.post("/login", RateLimiter.authRateLimiter,(req, res) => {
      this.authController.loginAdmin(req, res);
    });

    this.router.post("/refresh", (req, res) => {
      this.authController.refresh(req, res);
    });

    this.router.post("/logout", (req, res) => {
      this.authController.logout(req, res);
    });

    this.router.use(Auth.verifyAnyToken);
    this.router.post(
      "/me",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.authController.authMeAdmin(req, res);
      },
    );

    // admin management
    this.router.get("/", Role.authorize("admin", "superadmin"), (req, res) => {
      this.adminController.getAllAdmins(req, res);
    });

    this.router.post("/", Role.authorize("superadmin"), (req, res) => {
      this.adminController.createAdmin(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.adminController.getAdminById(req, res);
      },
    );

    this.router.put("/:id", Role.authorize("superadmin"), (req, res) => {
      this.adminController.updateAdmin(req, res);
    });

    this.router.delete("/:id", Role.authorize("superadmin"), (req, res) => {
      this.adminController.deleteAdmin(req, res);
    });

    return this.router;
  }
}

module.exports = AdminRoutes;
