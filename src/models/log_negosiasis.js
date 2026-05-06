const BaseModel = require("./base");

class LogNegosiasis extends BaseModel {
  constructor() {
    super("log_negosiasis");
  }

  async createLogNegosiasi(
    negosiasis_id,
    pengirim_id,
    penawaran_return,
    penawaran_nominal,
    catatan,
    diajukan_oleh = "investor",
    status = "pending",
    trx = this.knex,
  ) {
    try {
      const [log] = await trx(this.tableName)
        .insert({
          negosiasis_id,
          pengirim_id,
          penawaran_return,
          penawaran_nominal,
          catatan,
          diajukan_oleh,
          status,
        })
        .returning("*");
      return log;
    } catch (error) {
      throw error;
    }
  }

  async getLastLogByNegosiasiId(negosiasis_id, trx = this.knex) {
    try {
      const log = await trx(this.tableName)
        .where("negosiasis_id", negosiasis_id)
        .orderBy("created_at", "desc")
        .first();
      return log;
    } catch (error) {
      throw error;
    }
  }

  async getLogNegosiasiByNegosiasiId(negosiasis_id, trx = this.knex) {
    try {
      const log = await trx(this.tableName)
        .where("negosiasis_id", negosiasis_id)
        .select("*");
      return log;
    } catch (error) {
      throw error;
    }
  }

  async deleteLogNegosiasi(id, trx = this.knex) {
    try {
      const data = await trx(this.tableName).where({ id }).del();
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