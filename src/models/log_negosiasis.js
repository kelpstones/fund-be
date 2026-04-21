const BaseModel = require("./base");
class LogNegosiasis extends BaseModel {
  constructor() {
    super("log_negosiasis");
  }

  async createLogNegosiasi(
    negosiasi_id,
    pengirim_id,
    penawaran_return,
    catatan,
  ) {
    try {
      const log = await this.knex(this.tableName)
        .insert({
          negosiasi_id,
          pengirim_id,
          penawaran_return,
          catatan,
        })
        .returning("*");
      return log;
    } catch (error) {
      throw error;
    }
  }

  async getLastLogByNegosiasiId(negosiasi_id) {
    try {
      const log = await this.knex(this.tableName)
        .where("negosiasi_id", negosiasi_id)
        .orderBy("created_at", "desc")
        .first();
      return log;
    } catch (error) {
      throw error;
    }F
  }

  async getLogNegosiasiByNegosiasiId(negosiasi_id) {
    try {
      const log = await this.knex(this.tableName)
        .where("negosiasi_id", negosiasi_id)
        .returning("*");
      return log;
    } catch (error) {
      throw error;
    }
  }

  async deleteLogNegosiasi(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllLogNegosiasi(page = 1, limit = 10) {
    try {
      const logs = await this.knex(this.tableName)
        .select("*")
        .offset((page - 1) * limit)
        .limit(limit);
      return logs;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LogNegosiasis();
