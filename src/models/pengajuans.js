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
          "pengajuans.id",
          "pengajuans.bisnis_id",
          "pengajuans.target_pendanaan",
          "pengajuans.status",
          "pengajuans.total_pendanaan",
          "pengajuans.per_anual_return",
          "approvals.id as approval_id",
          "approvals.approver_id",
          "approvals.status as approval_status",
        ])
        .leftJoin("approvals", "pengajuans.id", "approvals.pengajuans_id")
        .first();
      return pengajuan;
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuan(
    id,
    target_pendanaan,
    total_pendanaan,
    per_anual_return,
  ) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        target_pendanaan: target_pendanaan,
        total_pendanaan: total_pendanaan,
        per_anual_return: per_anual_return,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuanStatus(id, status) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        status,
      });
      return data;
    } catch (error) {
      console.error(error);
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

  async getAllPengajuans(page = 1, limit = 10, status) {
    try {
      const pengajuans = await this.knex(this.tableName)
        .select(
          "pengajuans.id",
          "pengajuans.bisnis_id",
          "pengajuans.target_pendanaan",
          "pengajuans.status",
          "pengajuans.total_pendanaan",
          "pengajuans.per_anual_return",
          "approvals.id as approval_id",
          "approvals.approver_id",
          "approvals.status as approval_status",
          "approvals.catatan as approval_catatan",
        )
        .leftJoin("approvals", "pengajuans.id", "approvals.pengajuans_id")
        .offset((page - 1) * limit)
        .limit(limit)
        .where("pengajuans.status", "like", `%${status || ""}%`);
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
