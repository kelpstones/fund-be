const responseHelper = require("../utils/index").ResponseHelper;
const Notifications = require("../models/notifications");
const logger = require("../utils/index").logger;
class NotificationsController {
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      let notifications = [];
      // console.log("User:", req.user);
      // console.log("Admin:", req.admin);
      if (req.admin) {
        notifications = await Notifications.getNotificationsByAdminId(
          req.admin.id,
          limit,
          page,
        );
        // console.log("Admin Notifications:", req.admin.id);
      } else {
        notifications = await Notifications.getNotificationsByUserId(
          req.user.id,
          limit,
          page,
        );
      }

      return responseHelper.withPagination(
        res,
        "Notifications fetched successfully",
        notifications,
        { page, limit, totalItems: notifications.length },
      );
    } catch (error) {
      logger.error("An error occurred while fetching notifications data", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching notifications data",
      );
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notifications.markAsRead(id);
      if (!notification) {
        return responseHelper.error(res, "Notification not found", 404);
      }
      return responseHelper.success(
        res,
        "Notification marked as read successfully",
        notification,
      );
    } catch (error) {
      logger.error("An error occurred while marking notification as read", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while marking notification as read",
      );
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notifications.deleteNotification(id);
      if (!notification) {
        return responseHelper.error(res, "Notification not found", 404);
      }
      return responseHelper.success(
        res,
        "Notification deleted successfully",
        notification,
      );
    } catch (error) {
      logger.error("An error occurred while deleting notification", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while deleting notification",
      );
    }
  }
}

module.exports = NotificationsController;
