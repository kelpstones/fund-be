const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const { Auth, Role, RateLimiter } = require("../middlewares");
const AdminController = require("../controllers/adminController");
const SupportedBankController = require("../controllers/supportedBankController");
class AdminRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.adminController = new AdminController();
    this.supportedBankController = new SupportedBankController();
  }

  routes() {
    this.router.post("/login", RateLimiter.authRateLimiter, (req, res) => {
      this.authController.loginAdmin(req, res);
    });

    this.router.post("/refresh", (req, res) => {
      this.authController.refresh(req, res);
    });

    this.router.post("/logout", (req, res) => {
      this.authController.logout(req, res);
    });

    this.router.use(Auth.verifyAnyToken);
    this.router.get(
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
      "/banks",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.supportedBankController.getBanksForAdmin(req, res);
      },
    );

    this.router.post(
      "/banks",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.supportedBankController.createBank(req, res);
      },
    );

    this.router.put(
      "/banks/:id",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.supportedBankController.updateBank(req, res);
      },
    );

    this.router.delete(
      "/banks/:id",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.supportedBankController.deleteBank(req, res);
      },
    );

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
