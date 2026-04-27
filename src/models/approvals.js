const BaseModel = require("./base");

class Approvals extends BaseModel {
  constructor() {
    super("approvals");
  }

  async createApproval(pengajuans_id, approver_id, status, catatan) {
    try {
      const approval = await this.knex(this.tableName)
        .insert({
          pengajuans_id,
          approver_id,
          status,
          catatan,
        })
        .returning(["id", "pengajuans_id", "approver_id", "status", "catatan"]);
      return approval;
    } catch (error) {
      throw error;
    }
  }

  async getApprovalByPengajuanId(pengajuans_id) {
    try {
      const approvals = await this.knex(this.tableName)
        .select(["id", "pengajuans_id", "approver_id", "status", "catatan"])
        .where({ pengajuans_id })
        .first();
      return approvals;
    } catch (error) {
      throw error;
    }
  }

  async updateApproval(id, data) {
    try {
      const approval = await this.knex(this.tableName)
        .where({ id })
        .update({
          approver_id: data.approver_id,
          status: data.status,
          catatan: data.catatan,
        })
        .returning(["id", "pengajuans_id", "approver_id", "status", "catatan"]);
      return approval;
    } catch (error) {
      throw error;
    }
  }

  async deleteApproval(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllApprovals(page = 1, limit = 10) {
    try {
      const approvals = await this.knex(this.tableName)
        .select("*")
        .offset((page - 1) * limit)
        .limit(limit);
      return approvals;
    } catch (error) {
      throw error;
    }
  }

  async getApprovalById(id) {
    try {
      const approval = await this.knex(this.tableName).where({ id }).first();
      return approval;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Approvals();
