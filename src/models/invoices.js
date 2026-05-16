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
      ppn: row.ppn,
      ppn_amount: row.ppn_amount,
      biaya_admin: row.biaya_admin,
      total_nominal: row.total_nominal,
      return_investasi: row.return_investasi,
      status: row.status,
      tenggat_waktu: row.tenggat_waktu,
      created_at: row.created_at,
      updated_at: row.updated_at,
      detail_pengajuan: row.pengajuan_id
        ? {
            id: row.pengajuan_id,
            id_negosiasi: row.negosiasi_id,
            nama_bisnis: row.nama_bisnis,
            nama_pemilik: row.nama_pemilik,
            id_pemilik: row.pemilik_id,
            per_annual: row.per_annual,
            target_dana: row.target_dana,
          }
        : null,
      investor: row.investor_id
        ? {
            id: row.investor_id,
            nama: row.nama_investor,
          }
        : null,
    };
  }

  #baseQuery(trx = this.knex) {
    return trx(this.tableName)
      .select(
        "invoices.*",
        "bisnis.nama_bisnis",
        "investor.nama as nama_investor",
        "pemilik.nama as nama_pemilik",
        "pemilik.id as pemilik_id",
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

  async createInvoice(
    id_negosiasi,
    pengajuan_id,
    investor_id,
    nominal_tagihan,
    return_investasi,
    kode_pembayaran,
    tenggat_waktu,
    trx = this.knex,
  ) {
    try {
      const subtotal = parseFloat(nominal_tagihan); 
      const adminRate = parseFloat(process.env.ADMIN_FEE_RATE || 1);
      const ppnRate = parseFloat(process.env.PPN_RATE || 12); 

      const biayaAdmin = subtotal * (adminRate / 100); 
      const ppnAmount = biayaAdmin * (ppnRate / 100); 
      const totalNominal = subtotal + biayaAdmin + ppnAmount; 

      const [row] = await trx(this.tableName)
        .insert({
          negosiasi_id: id_negosiasi,
          pengajuan_id,
          investor_id,
          nominal_tagihan: subtotal,
          ppn: ppnRate,
          ppn_amount: ppnAmount,
          biaya_admin: biayaAdmin,
          total_nominal: totalNominal,
          return_investasi,
          kode_pembayaran,
          tenggat_waktu,
          status: "pending",
        })
        .returning("id");

      return await this.getInvoiceById(row.id, trx);
    } catch (error) {
      throw error;
    }
  }

  async getAllInvoices(
    page = 1,
    limit = 10,
    startDate,
    endDate,
    status,
    trx = this.knex,
  ) {
    try {
      let query = this.#baseQuery(trx);
      if (startDate && endDate)
        query = query.whereBetween("invoices.created_at", [startDate, endDate]);
      if (status) query = query.where("invoices.status", status);

      const results = await query
        .orderBy("invoices.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row, trx));
    } catch (error) {
      throw error;
    }
  }

  async getInvoiceById(id, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx).where("invoices.id", id).first();
      return this.#formatResponse(row, trx);
    } catch (error) {
      throw error;
    }
  }

  async getInvoiceByKodePembayaran(kode_pembayaran, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx)
        .where("invoices.kode_pembayaran", kode_pembayaran)
        .first();
      return this.#formatResponse(row, trx);
    } catch (error) {
      throw error;
    }
  }

  async getInvoicesByInvestor(
    investor_id,
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    trx = this.knex,
  ) {
    try {
      let query = this.#baseQuery(trx).where(
        "invoices.investor_id",
        investor_id,
      );
      if (startDate && endDate)
        query = query.whereBetween("invoices.created_at", [startDate, endDate]);
      if (status) query = query.where("invoices.status", status);

      const results = await query
        .orderBy("invoices.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row, trx));
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
      return await this.getInvoiceById(id, trx);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Invoices();
