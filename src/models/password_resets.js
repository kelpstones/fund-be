const baseModel = require("./base");

class PasswordResets extends baseModel {
  constructor() {
    super("password_resets");
  }

  async createToken(user_id, token, trx = this.knex) {
    try {
      await trx(this.tableName).where({ user_id }).del();

      const expires_at = new Date(
        Date.now() +
          parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS) * 60 * 60 * 1000,
      ); // 1 jam
      await trx(this.tableName).insert({ user_id, token, expires_at });

      return token;
    } catch (error) {
      console.error("Error creating password reset token:", error);
      throw error;
    }
  }

  async findValidToken(token) {
    try {
      const validToken = await this.knex(this.tableName)
        .where({ token })
        .andWhere("expires_at", ">", new Date())
        .first();

      return validToken;
    } catch (error) {
      console.error("Error finding valid password reset token:", error);
      throw error;
    }
  }

  async deleteToken(token, trx = this.knex) {
    try {
      await trx(this.tableName).where({ token }).del();
    } catch (error) {
      console.error("Error deleting password reset token:", error);
      throw error;
    }
  }

  async existsValidTokenForUser(user_id) {
    try {
      const token = await this.knex(this.tableName)
        .where({ user_id })
        .andWhere("expires_at", ">", new Date())
        .first();
      return !!token;
    } catch (error) {
      console.error(
        "Error checking existing valid password reset token for user:",
        error,
      );
      throw error;
    }
  }
}

module.exports = new PasswordResets();
