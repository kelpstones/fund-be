const BaseModel = require("./base");

class Negosiasis extends BaseModel {
  constructor() {
    super("negosiasis");
  }

  async createNegosiasi(pengajuan_id, investor_id, status, id_terakhir_oleh) {
    try {
      const negosiasi = await this.knex(this.tableName)
        .insert({
          pengajuan_id,
          investor_id,
          status,
          id_terakhir_oleh,
        })
        .returning("*");
      return negosiasi;
    } catch (error) {
      throw error;
    }
  }

  async getNegosiasiByPengajuanId(pengajuan_id) {
    try {
      const negosiasi = await this.knex(this.tableName)
        .where("pengajuan_id", pengajuan_id)
        .returning("*");
      return negosiasi;
    } catch (error) {
      throw error;
    }
  }

  async updateNegosiasi(id, status, id_terakhir_oleh) {
    try {
      const negosiasi = await this.knex(this.tableName)
        .where("id", id)
        .update({
          status,
          id_terakhir_oleh,
        })
        .returning("*");
      return negosiasi;
    } catch (error) {
      throw error;
    }
  }

  async deleteNegosiasi(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllNegosiasi(page = 1, limit = 10) {
    try {
      const negosiasis = await this.knex(this.tableName)
        .select("*")
        .offset((page - 1) * limit)
        .limit(limit);
      return negosiasis;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Negosiasis();
