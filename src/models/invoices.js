const BaseModel = require("./base");

class Invoices extends BaseModel {
  constructor() {
    super("invoices");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      kode_pembayaran: row.kode_pembayaran,
      nominal_tagihan: row.nominal_tagihan,
      status: row.status,
      tenggat_waktu: row.tenggat_waktu,
      created_at: row.created_at,
      updated_at: row.updated_at,
      detail_pengajuan: {
        id: row.pengajuan_id,
        id_negosiasi: row.negosiasi_id,
        nama_bisnis: row.nama_bisnis,
        nama_pemilik: row.nama_pemilik,
        per_annual: row.per_annual,
        target_dana: row.target_dana,
      },
      investor: {
        id: row.investor_id,
        nama: row.nama_investor,
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "invoices.*",
        "bisnis.nama_bisnis",
        "investor.nama as nama_investor",
        "pemilik.nama as nama_pemilik",
        "pengajuans.target_pendanaan as target_dana",
        "pengajuans.per_anual_return as per_annual",
        "pengajuans.id as pengajuan_id",
        "negosiasis.id as negosiasi_id",
      )
      .join("pengajuans", "invoices.pengajuan_id", "pengajuans.id")
      .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
      .leftJoin("users as investor", "invoices.investor_id", "investor.id")
      .leftJoin("users as pemilik", "bisnis.user_id", "pemilik.id")
      .leftJoin("negosiasis", "invoices.negosiasi_id", "negosiasis.id");
  }

  async createInvoice(id_negosiasi, pengajuan_id, investor_id, nominal_tagihan, kode_pembayaran, tenggat_waktu) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({
          negosiasi_id: id_negosiasi,
          pengajuan_id,
          investor_id,
          nominal_tagihan,
          kode_pembayaran,
          tenggat_waktu,
          status: "pending",
        })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getAllInvoices(page = 1, limit = 10, startDate, endDate, status) {
    try {
      let query = this.#baseQuery();
      if (startDate && endDate) query = query.whereBetween("invoices.created_at", [startDate, endDate]);
      if (status) query = query.where("invoices.status", status);

      const results = await query
        .orderBy("invoices.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const row = await this.#baseQuery().where("invoices.id", id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getInvoicesByInvestor(investor_id, page = 1, limit = 10, status, startDate, endDate) {
    try {
      let query = this.#baseQuery().where("invoices.investor_id", investor_id);
      if (startDate && endDate) query = query.whereBetween("invoices.created_at", [startDate, endDate]);
      if (status) query = query.where("invoices.status", status);

      const results = await query
        .orderBy("invoices.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id, status, trx = this.knex) {
    try {
      await trx(this.tableName).where({ id }).update({
        status,
        updated_at: trx.fn.now(),
      });
      return await this.getInvoiceById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Invoices();