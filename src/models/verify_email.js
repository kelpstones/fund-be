const BaseModel = require("./base");

class VerifyEmail extends BaseModel {
  constructor() {
    super("verify_email");
  }

  async createToken(user_id, token, trx = this.knex) {
    try {
      await trx(this.tableName).where({ user_id }).del();

      const expires_at = new Date(
        Date.now() +
          parseInt(process.env.VERIFY_EMAIL_EXPIRY_HOURS) * 60 * 60 * 1000,
      ); // 24 jam

      await trx(this.tableName).insert({ user_id, token, expires_at });

      return token;
    } catch (error) {
      throw error;
    }
  }

  async findValidToken(token) {
    try {
      const validToken = await this.knex(this.tableName)
        .where({ token })
        .where("expires_at", ">", this.knex.fn.now())
        .first();

      return validToken;
    } catch (error) {
      console.error("Error finding valid verify email token:", error);
      throw error;
    }
  }

  async deleteByUserId(user_id) {
    await this.knex(this.tableName).where({ user_id }).del();
  }
}

module.exports = new VerifyEmail();
