const BaseModel = require("./base");

class VerifyEmail extends BaseModel {
  constructor() {
    super("verify_email");
  }

  async createToken(user_id, token) {
    try {
      await this.knex(this.tableName).where({ user_id }).del();

      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

      await this.knex(this.tableName).insert({ user_id, token, expires_at });

      return token;
    } catch (error) {
      throw error;
    }
  }

  async findValidToken(token) {
    return await this.knex(this.tableName)
      .where({ token })
      .where("expires_at", ">", this.knex.fn.now())
      .first();
  }

  async deleteByUserId(user_id) {
    await this.knex(this.tableName).where({ user_id }).del();
  }
}

module.exports = new VerifyEmail();
