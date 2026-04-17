const responseHelper = require("../utils/response");
const Notifications = require("../models/notifications");

class NotificationsController {
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      let notifications = [];

      if (req.admin) {
        notifications = await Notifications.getNotificationsByAdminId(
          req.admin.id,
          limit,
          page,
        );
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while deleting notification",
      );
    }
  }
}

module.exports = NotificationsController;
