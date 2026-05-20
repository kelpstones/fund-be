const { generateRefreshToken } = require("../utils/jwt");
const decodeToken = require("../utils/jwt").decodeToken;
const BaseModel = require("./base");

class RefreshTokens extends BaseModel {
  constructor() {
    super("refresh_tokens");
  }

  async createToken(ownerId, ownerType = "users") {
    try {
      const token = generateRefreshToken(ownerId, ownerType);
      const decoded = decodeToken(token);
      const expiresAt = new Date(decoded.exp * 1000);
      await this.knex(this.tableName).insert({
        token,
        owner_id: ownerId,
        owner_type: ownerType,
        expires_at: expiresAt,
      });
      return token;
    } catch (error) {
      throw error;
    }
  }

  async findValid(token) {
    try {
      const record = await this.knex(this.tableName)
        .where({ token, is_revoked: false })
        .andWhere("expires_at", ">", this.knex.fn.now())
        .first();
      return record || null;
    } catch (error) {
      throw error;
    }
  }

  async revokeToken(token, trx = null) {
    try {
      const query = (trx || this.knex)(this.tableName)
        .where({ token })
        .update({
          is_revoked: true,
          updated_at: (trx || this.knex).fn.now(),
        });
      return await query;
    } catch (error) {
      throw error;
    }
  }

  async revokeAllForOwner(ownerId, ownerType, trx = null) {
    try {
      const query = (trx || this.knex)(this.tableName)
        .where({ owner_id: ownerId, owner_type: ownerType })
        .update({
          is_revoked: true,
          updated_at: (trx || this.knex).fn.now(),
        });
      return await query;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RefreshTokens();
