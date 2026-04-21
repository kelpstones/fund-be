const BaseModel = require("./base");

class Invoices extends BaseModel {
  constructor() {
    super("invoices");
  }

  async createInvoice(
    id_negosiasi,
    id_pengajuan,
    id_investor,
    nominal_tagihan,
  ) {
    try {
      const [invoice] = await this.knex(this.tableName)
        .insert({
          id_negosiasi,
          id_pengajuan,
          id_investor,
          nominal_tagihan,
          status: "pending",
        })
        .returning("*");
      return invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      return await this.knex(this.tableName)
        .select(
          "invoices.*",
          "pengajuans.target_dana",
          "pengajuans.per_annual",
          "bisnis.nama_usaha as nama_bisnis",
          "users.nama as nama_investor",
        )
        .leftJoin("pengajuans", "invoices.id_pengajuan", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.id_bisnis", "bisnis.id")
        .leftJoin("users", "invoices.id_investor", "users.id")
        .where("invoices.id", id)
        .first();
    } catch (error) {
      throw error;
    }
  }

  async getInvoicesByInvestor(investor_id) {
    try {
      return await this.knex(this.tableName)
        .select("invoices.*", "bisnis.nama_usaha")
        .join("pengajuans", "invoices.id_pengajuan", "pengajuans.id")
        .join("bisnis", "pengajuans.id_bisnis", "bisnis.id")
        .where("id_investor", investor_id)
        .orderBy("created_at", "desc");
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      const [updated] = await this.knex(this.tableName)
        .where({ id })
        .update({
          status,
          updated_at: this.knex.fn.now(),
        })
        .returning("*");
      return updated;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Invoices();
