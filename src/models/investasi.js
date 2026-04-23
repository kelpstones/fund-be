const BaseModel = require("./base");

class Investasi extends BaseModel {
  constructor() {
    super("investasis");
  }

  async createInvestasi(data, trx = this.knex) {
    try {
      // console.log("Creating investasi with data:", data);
      const investasi = await trx(this.tableName)
        .insert({
          investor_id: data.investor_id,
          pengajuans_id: data.pengajuans_id,
          negosiasis_id: data.negosiasi_id,
          nominal_investasi: data.nominal_investasi,
          return_investasi: data.return_investasi,
        })
        .returning("*");
      return investasi;
    } catch (error) {
      console.error("Error creating investasi:", error);
      throw error;
    }
  }

  async getAllInvestasi(page = 1, limit = 10, startDate, endDate) {
    try {
      const investasiList = await this.knex(this.tableName)
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
          "users.nama as investor_name",
          "users.id as investor_id",
          "negosiasis.status as negosiasi_status",
        )
        .leftJoin("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users", "investasis.investor_id", "users.id")
        .leftJoin("negosiasis", "investasis.negosiasis_id", "negosiasis.id") // Tambahan: Wajib di-join agar bisa ambil status
        
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);

      return investasiList.map((row) => ({
        id: row.id,
        nominal_investasi: row.nominal_investasi,
        return_investasi: row.return_investasi,
        created_at: row.created_at,
        bisnis: {
          id: row.bisnis_id,
          nama_bisnis: row.nama_bisnis,
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
      }));
    } catch (error) {
      console.error("Error fetching investasi:", error);
      throw error;
    }
  }

  async getInvestasiByUserId(user_id, role, page = 1, limit = 10, startDate, endDate) {
    try {
      const investasiList = await this.knex(this.tableName)
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
          "users.nama as investor_name",
          "users.id as investor_id",
          "negosiasis.status as negosiasi_status",
        )
        .leftJoin("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users", "investasis.investor_id", "users.id")
        .leftJoin("negosiasis", "investasis.negosiasis_id", "negosiasis.id") // Tambahan: Wajib di-join agar bisa ambil status
        .where(
          role === "investor" ? "investasis.investor_id" : "bisnis.user_id",
          user_id,
        )
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);

      return investasiList.map((row) => ({
        id: row.id,
        nominal_investasi: row.nominal_investasi,
        return_investasi: row.return_investasi,
        created_at: row.created_at,
        bisnis: {
          id: row.bisnis_id,
          nama_bisnis: row.nama_bisnis,
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
      }));
    } catch (error) {
      console.error("Error fetching investasi:", error);
      throw error;
    }
  }

  async getInvestasiById(id) {
    try {
      const investasi = await this.knex(this.tableName)
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
          "users.nama as investor_name",
          "users.id as investor_id",
          "negosiasis.status as negosiasi_status",
        )
        .leftJoin("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users", "investasis.investor_id", "users.id")
        .leftJoin("negosiasis", "investasis.negosiasis_id", "negosiasis.id")
        .where("investasis.id", id)
        .first();
      return {
        id: investasi.id,
        nominal_investasi: investasi.nominal_investasi,
        return_investasi: investasi.return_investasi,
        created_at: investasi.created_at,
        bisnis: {
          id: investasi.bisnis_id,
          nama_bisnis: investasi.nama_bisnis,
        },
        investor: {
          id: investasi.investor_id,
          nama: investasi.investor_name,
        },
        negosiasi: investasi.negosiasis_id
          ? {
              id: investasi.negosiasis_id,
              status: investasi.negosiasi_status,
            }
          : null,
      };
    } catch (error) {
      console.error("Error fetching investasi by ID:", error);
      throw error;
    }
  }

  async getInvestasiByPengajuanId(pengajuans_id, page = 1, limit = 10) {
    try {
      const investasiList = await this.knex(this.tableName)
        .select(
          "investasis.id",
          "investasis.investor_id",
          "investasis.pengajuans_id",
          "investasis.negosiasis_id",
          "investasis.nominal_investasi",
          "investasis.return_investasi",
          "investasis.created_at",
          "users.nama as investor_name",
          "users.id as investor_id",
          "negosiasis.status as negosiasi_status",
          "bisnis.id as bisnis_id",
          "bisnis.nama_bisnis as nama_bisnis",
        )
        .leftJoin("users", "investasis.investor_id", "users.id")
        .leftJoin("negosiasis", "investasis.negosiasis_id", "negosiasis.id")
        .leftJoin("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .where("investasis.pengajuans_id", pengajuans_id)
        .orderBy("investasis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);

      return investasiList.map((row) => ({
        id: row.id,
        nominal_investasi: row.nominal_investasi,
        return_investasi: row.return_investasi,
        created_at: row.created_at,
        bisnis: {
          id: row.bisnis_id,
          nama_bisnis: row.nama_bisnis,
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
      }));
    } catch (error) {
      console.error("Error fetching investasi by pengajuan ID:", error);
      throw error;
    }
  }
}

module.exports = new Investasi();
