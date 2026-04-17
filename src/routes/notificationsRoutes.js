const express = require("express");
const router = express.Router();
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
const NotificationsController = require("../controllers/notificationsController");

class NotificationsRoutes {
  constructor() {
    this.router = router;
    this.notificationsController = new NotificationsController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.notificationsController.getNotifications(req, res);
      },
    );

    this.router.put(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.notificationsController.markAsRead(req, res);
      },
    );

    router.delete(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.notificationsController.deleteNotification(req, res);
      },
    );

    return this.router;
  }
}

module.exports = NotificationsRoutes;
