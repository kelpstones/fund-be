const BaseModel = require("./base");

class Investasi extends BaseModel {
  constructor() {
    super("investasis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      nominal_investasi: row.nominal_investasi,
      return_investasi: row.return_investasi,
      created_at: row.created_at,
      bisnis: {
        id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
        tipe_usaha: row.bisnis_tipe_usaha,
      },
      investor: {
        id: row.investor_id,
        nama: row.investor_name,
      },
      negosiasi: row.negosiasis_id
        ? {
            id: row.negosiasis_id,
            status: row.negosiasi_status,
          }
        : null,
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "investasis.id",
        "investasis.investor_id",
        "investasis.pengajuans_id",
        "investasis.negosiasis_id",
        "investasis.nominal_investasi",
        "investasis.return_investasi",
        "investasis.created_at",
        "pengajuans.bisnis_id",
        "bisnis.nama_bisnis",
        "bisnis.tipe_usaha as bisnis_tipe_usaha",
        "users.nama as investor_name",
        "users.id as investor_id",
        "negosiasis.status as negosiasi_status",
      )
      .leftJoin("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
      .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
      .leftJoin("users", "investasis.investor_id", "users.id")
      .leftJoin("negosiasis", "investasis.negosiasis_id", "negosiasis.id");
  }

  async createInvestasi(data, trx = this.knex) {
    try {
      const [row] = await trx(this.tableName)
        .insert({
          investor_id: data.investor_id,
          pengajuans_id: data.pengajuans_id,
          negosiasis_id: data.negosiasi_id,
          nominal_investasi: data.nominal_investasi,
          return_investasi: data.return_investasi,
        })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getAllInvestasi(page = 1, limit = 10) {
    try {
      const results = await this.#baseQuery()
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getInvestasiById(id) {
    try {
      const row = await this.#baseQuery().where("investasis.id", id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getInvestasiByUserId(user_id, role, page = 1, limit = 10) {
    try {
      const column = role === "investor" ? "investasis.investor_id" : "bisnis.user_id";
      const results = await this.#baseQuery()
        .where(column, user_id)
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getInvestasiByPengajuanId(pengajuans_id, page = 1, limit = 10) {
    try {
      const results = await this.#baseQuery()
        .where("investasis.pengajuans_id", pengajuans_id)
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Investasi();