const BaseModel = require("./base");

class Notifications extends BaseModel {
  constructor() {
    super("notifications");
  }

  async createNotification(
    user_id,
    admin_id,
    title,
    message,
    type,
    reference_id,
  ) {
    try {
      const notification = await this.knex(this.tableName)
        .insert({
          user_id,
          admin_id,
          title,
          message,
          type,
          reference_id,
        })
        .returning("*");
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotificationsByUserId(user_id, limit = 10, page = 1) {
    try {
      const notifications = await this.knex(this.tableName)
        .where("user_id", user_id)
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getNotificationsByAdminId(admin_id, limit = 10, page = 1) {
    try {
      const notifications = await this.knex(this.tableName)
        .where("admin_id", admin_id)
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async markAsRead(notification_id) {
    try {
      return await this.knex(this.tableName)
        .where("id", notification_id)
        .update({ is_read: true })
        .returning("*");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async deleteNotification(notification_id) {
    try {
      return await this.knex(this.tableName)
        .where("id", notification_id)
        .del()
        .returning("*");
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}

module.exports = new Notifications();
