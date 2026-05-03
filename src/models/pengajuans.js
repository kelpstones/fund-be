const BaseModel = require("./base");

class Pengajuan extends BaseModel {
  constructor() {
    super("pengajuans");
  }

  #formatResponse(row, trx = this.knex) {
    if (!row) return null;
    return {
      id: row.id,
      target_pendanaan: row.target_pendanaan,
      total_pendanaan: row.total_pendanaan,
      per_anual_return: row.per_anual_return,
      status: row.status,
      bisnis_id: row.bisnis_id,
      approval: row.approval_id
        ? {
            id: row.approval_id,
            approver_id: row.approver_id,
            status: row.approval_status,
            catatan: row.approval_catatan,
          }
        : null,
      approver: row.approver_id
        ? {
            id: row.approver_id,
            nama: row.approver_nama,
            email: row.approver_email,
          }
        : null,
    };
  }

  #baseQuery(trx = this.knex) {
    return trx(this.tableName)
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
        "admins.nama as approver_nama",
        "admins.email as approver_email",
      )
      .leftJoin("approvals", "pengajuans.id", "approvals.pengajuans_id")
      .leftJoin("admins", "approvals.approver_id", "admins.id");
  }

  async createPengajuan(
    bisnis_id,
    target_pendanaan,
    status,
    total_pendanaan,
    per_anual_return,
  ) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({
          bisnis_id,
          target_pendanaan,
          status,
          total_pendanaan,
          per_anual_return,
        })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getAllPengajuans(page = 1, limit = 10, status) {
    try {
      const results = await this.#baseQuery()
        .where("pengajuans.status", "like", `%${status || ""}%`)
        .orderBy("pengajuans.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getPengajuanById(id, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx).where("pengajuans.id", id).first();
      return this.#formatResponse(row, trx);
    } catch (error) {
      throw error;
    }
  }

  async getPengajuanByBisnisId(bisnis_id, trx = this.knex) {
    try {
      const row = await this.#baseQuery()
        .where("pengajuans.bisnis_id", bisnis_id)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuan(
    id,
    target_pendanaan,
    total_pendanaan,
    per_anual_return,
    status,
    trx = this.knex,
  ) {
    try {
      await trx(this.tableName).where({ id }).update({
        target_pendanaan,
        total_pendanaan,
        per_anual_return,
        status,
      });
      return await this.getPengajuanById(id, trx);
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuanTotalPendanaan(id, tambahan_nominal, trx = this.knex) {
    try {
      await trx(this.tableName)
        .where({ id })
        .increment("total_pendanaan", tambahan_nominal)
        .update({ updated_at: trx.fn.now() });
      return await this.getPengajuanById(id, trx);
    } catch (error) {
      throw error;
    }
  }

  async updatePengajuanStatus(id, status, trx = this.knex) {
    try {
      await trx(this.tableName).where({ id }).update({ status });
      return await this.getPengajuanById(id, trx);
    } catch (error) {
      throw error;
    }
  }

  async deletePengajuan(id, trx = this.knex) {
    try {
      await trx(this.tableName).where({ id }).del();
      return { message: "Pengajuan berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Pengajuan();
