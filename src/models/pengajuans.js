const BaseModel = require("./base");

class Pengajuan extends BaseModel {
  constructor() {
    super("pengajuans");
  }

  async createPengajuan(
    bisnis_id,
    target_pendanaan,
    status,
    total_pendanaan,
    per_anual_return,
  ) {
    try {
      const pengajuan = await this.knex(this.tableName)
        .insert({
          bisnis_id,
          target_pendanaan,
          status,
          total_pendanaan,
          per_anual_return,
        })
        .returning([
          "id",
          "bisnis_id",
          "target_pendanaan",
          "status",
          "total_pendanaan",
          "per_anual_return",
        ]);
      return pengajuan;
    } catch (error) {
      throw error;
    }
  }

  async getPengajuanByBisnisId(bisnis_id) {
    try {
      const pengajuan = await this.knex(this.tableName)
        .where("bisnis_id", bisnis_id)
        .select([
          "id",
          "bisnis_id",
          "target_pendanaan",
          "status",
          "total_pendanaan",
          "per_anual_return",
        ]);
      return pengajuan;
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuan(id, status) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        status,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deletePengajuan(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllPengajuans(page = 1, limit = 10) {
    try {
      const pengajuans = await this.knex(this.tableName)
        .select("*")
        .offset((page - 1) * limit)
        .limit(limit);
      return pengajuans;
    } catch (error) {
      throw error;
    }
  }

  async getPengajuanById(id) {
    try {
      const pengajuan = await this.knex(this.tableName).where({ id }).first();
      return pengajuan;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Pengajuan();
