const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const BisnisRoutes = require("./bisnisRoutes");
const { Auth, Role, RateLimiter } = require("../middlewares");
const KelasRoutes = require("./kelasRoutes");
const UserController = require("../controllers/userController");
class UserRoutes {
  constructor() {
    this.router = router;
    this.authController = new AuthController();
    this.bisnisRoutes = new BisnisRoutes();
    this.kelasRoutes = new KelasRoutes();
    this.userController = new UserController();
  }
  routes() {
    this.router.post("/register", RateLimiter.authRateLimiter, (req, res) => {
      this.authController.register(req, res);
    });
    this.router.post("/login", RateLimiter.authRateLimiter, (req, res) => {
      this.authController.login(req, res);
    });

    this.router.get("/verify-email", (req, res) => {
      this.authController.verifyEmail(req, res);
    });

    this.router.post(
      "/resend-verify",
      RateLimiter.emailRateLimiter,
      (req, res) => {
        this.authController.resendVerification(req, res);
      },
    );

    this.router.post(
      "/forgot-password",
      RateLimiter.emailRateLimiter,
      (req, res) => {
        this.authController.forgotPassword(req, res);
      },
    );

    this.router.post("/reset-password", (req, res) => {
      this.authController.resetPassword(req, res);
    });

    this.router.use(Auth.verifyAnyToken);
    this.router.post("/me", Role.authorize("umkm", "investor"), (req, res) => {
      this.authController.authMe(req, res);
    });

    this.router.get(
      "/profile",
      Role.authorize("umkm", "investor"),
      (req, res) => {
        this.userController.getUserProfile(req, res);
      },
    );

    this.router.get(
      "/profile/investor",
      Role.authorize("investor"),
      (req, res) => {
        this.userController.getInvestorProfile(req, res);
      },
    );

    this.router.put(
      "/profile",
      Role.authorize("umkm", "investor"),
      (req, res) => {
        this.userController.updateUserProfile(req, res);
      },
    );
    this.router.get(
      "/users",
      Role.authorize("superadmin", "admin"),
      (req, res) => {
        this.userController.getAllUsers(req, res);
      },
    );

    this.router.get("/:id", Role.authorize("umkm", "investor"), (req, res) => {
      this.userController.getUserById(req, res);
    });
    return this.router;
  }
}

module.exports = UserRoutes;
