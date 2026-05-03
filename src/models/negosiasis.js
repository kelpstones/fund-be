const BaseModel = require("./base");

class Negosiasis extends BaseModel {
  constructor() {
    super("negosiasis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      status: row.status,
      id_terakhir_oleh: row.id_terakhir_oleh,
      created_at: row.created_at,
      pengajuan: {
        id: row.pengajuan_id,
        target_pendanaan: row.target_pendanaan,
        per_anual_return: row.per_anual_return,
      },
      bisnis: row.bisnis_id
        ? {
            id: row.bisnis_id,
            nama: row.nama_bisnis,
            user_id: row.bisnis_user_id,
          }
        : null,
      investor: {
        id: row.investor_id,
        nama: row.investor_nama,
        email: row.investor_email,
      },
      bisnis_owner: {
        id: row.bisnis_owner_id,
        nama: row.bisnis_owner_nama,
      },
      negosiasi_terakhir: row.last_penawaran_return
        ? {
            penawaran_return: row.last_penawaran_return,
            catatan: row.last_catatan,
            penawaran_nominal: row.last_penawaran_nominal,
          }
        : null,
    };
  }

  #baseQuery(trx = this.knex) {
    return trx(this.tableName)
      .select(
        "negosiasis.id",
        "negosiasis.status",
        "negosiasis.id_terakhir_oleh",
        "negosiasis.created_at",
        "users.nama as investor_nama",
        "users.email as investor_email",
        "users.id as investor_id",
        "bisnis_owner.nama as bisnis_owner_nama",
        "bisnis_owner.id as bisnis_owner_id",
        "pengajuans.id as pengajuan_id",
        "pengajuans.target_pendanaan",
        "pengajuans.per_anual_return",
        "bisnis.id as bisnis_id",
        "bisnis.nama_bisnis",
        "bisnis.user_id as bisnis_user_id",
        trx.raw("l.penawaran_return as last_penawaran_return"),
        trx.raw("l.catatan as last_catatan"),
        trx.raw("l.penawaran_nominal as last_penawaran_nominal"),
      )
      .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
      .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
      .join("users as bisnis_owner", "bisnis.user_id", "bisnis_owner.id")
      .join("users", "negosiasis.investor_id", "users.id")
      .leftJoin("log_negosiasis as l", function () {
        this.on("negosiasis.id", "l.negosiasi_id").andOn(
          "l.created_at",
          "=",
          trx.raw(
            "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
          ),
        );
      });
  }

  async createNegosiasi(
    pengajuans_id,
    investor_id,
    status,
    id_terakhir_oleh,
    trx = this.knex,
  ) {
    try {
      const [row] = await trx(this.tableName)
        .insert({ pengajuans_id, investor_id, status, id_terakhir_oleh })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getAllNegosiasis(page = 1, limit = 10, status = "") {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

    
      const dataQuery = this.#baseQuery()
        .where(function () {
          if (status) {
            // exact match karena status adalah enum
            this.where("negosiasis.status", status);
          }
        })
        .orderBy("negosiasis.created_at", "desc")
        .limit(parseInt(limit))
        .offset(offset);

    
      const countQuery = this.knex("negosiasis")
        .where(function () {
          if (status) {
            this.where("status", status);
          }
        })
        .count("id as total")
        .first();

     
      const [results, countResult] = await Promise.all([dataQuery, countQuery]);

      const total = parseInt(countResult.total);

      return {
        data: results.map((row) => this.#formatResponse(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getNegosiasiById(id, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx).where("negosiasis.id", id).first();
      return this.#formatResponse(row, trx);
    } catch (error) {
      throw error;
    }
  }

  async getNegosiasiByPengajuanId(pengajuans_id) {
    try {
      const results = await this.#baseQuery().where(
        "negosiasis.pengajuans_id",
        pengajuans_id,
      );
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getNegosiasiByUserId(user_id, role) {
    try {
      const column =
        role === "investor" ? "negosiasis.investor_id" : "bisnis.user_id";
      const results = await this.#baseQuery().where(column, user_id);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async updateNegosiasi(id, status, id_terakhir_oleh, trx = this.knex) {
    try {
      await trx(this.tableName)
        .where({ id })
        .update({ status, id_terakhir_oleh });
      return await this.getNegosiasiById(id, trx);
    } catch (error) {
      throw error;
    }
  }

  async deleteNegosiasi(id, trx = this.knex) {
    try {
      await trx(this.tableName).where({ id }).del();
      return { message: "Negosiasi berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Negosiasis();
