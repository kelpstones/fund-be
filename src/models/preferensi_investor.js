const BaseModel = require("./base");

class PreferensiInvestor extends BaseModel {
  constructor() {
    super("preferensi_investor");
  }

  async getByInvestorId(investor_id) {
    return this.knex(this.tableName).where({ investor_id }).first();
  }

  async upsert(investor_id, data) {
    const existing = await this.getByInvestorId(investor_id);
    if (existing) {
      await this.knex(this.tableName)
        .where({ investor_id })
        .update({ ...data, updated_at: this.knex.fn.now() });
    } else {
      await this.knex(this.tableName).insert({ investor_id, ...data });
    }
    return this.getByInvestorId(investor_id);
  }
}

module.exports = new PreferensiInvestor();
