const BaseModel = require("./base");

class DistribusiProfits extends BaseModel {
  constructor() {
    super("distribusi_profits");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      periode: row.periode,
      nominal_profit: row.nominal_profit,
      status: row.status,
      created_at: row.created_at,
      // Data Relasi
      investor: {
        id: row.investor_id,
        nama: row.investor_nama,
      },
      investasi: {
        id: row.investasi_id,
        nominal_investasi: row.nominal_investasi,
        return_investasi: row.return_investasi,
      },
      penjualan: {
        id: row.penjualans_id,
        laba_bersih: row.laba_bersih,
        bisnis_id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "distribusi_profits.*",
        "users.nama as investor_nama",
        "investasis.nominal_investasi",
        "investasis.return_investasi",
        "penjualans.laba_bersih",
        "pengajuans.bisnis_id",
        "bisnis.nama_bisnis",
      )
      .join("users", "distribusi_profits.investor_id", "users.id")
      .join("investasis", "distribusi_profits.investasi_id", "investasis.id")
      .join("penjualans", "distribusi_profits.penjualans_id", "penjualans.id")
      .join("pengajuans", "penjualans.pengajuans_id", "pengajuans.id")
      .join("bisnis", "pengajuans.bisnis_id", "bisnis.id");
  }

  async bulkCreate(dataArray, trx = this.knex) {
    try {
      const result = await trx(this.tableName)
        .insert(dataArray)
        .returning("id");
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAll(page = 1, limit = 10) {
    try {
      const results = await this.#baseQuery()
        .orderBy("distribusi_profits.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);

      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getByInvestorId(investor_id, page = 1, limit = 10) {
    try {
      const results = await this.#baseQuery()
        .where("distribusi_profits.investor_id", investor_id)
        .orderBy("distribusi_profits.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);

      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getByPenjualanId(penjualans_id) {
    try {
      const results = await this.#baseQuery()
        .where("distribusi_profits.penjualans_id", penjualans_id)
        .orderBy("distribusi_profits.created_at", "desc");

      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const row = await this.#baseQuery()
        .where("distribusi_profits.id", id)
        .first();

      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }
  async updateStatus(id, status) {
    try {
      await this.knex(this.tableName)
        .where("id", id)
        .update({ status, updated_at: this.knex.fn.now() });

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DistribusiProfits();