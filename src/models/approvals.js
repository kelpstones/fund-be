const BaseModel = require("./index");

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
        .where({ pengajuans_id })
        .select(["id", "pengajuans_id", "approver_id", "status", "catatan"]);
      return approvals;
    } catch (error) {
      throw error;
    }
  }

  async updateApproval(id, status, catatan) {
    try {
      const approval = await this.knex(this.tableName)
        .where({ id })
        .update({ status, catatan })
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

  async getAllApprovals() {
    try {
      const approvals = await this.knex(this.tableName).select("*");
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
