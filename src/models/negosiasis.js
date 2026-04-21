const BaseModel = require("./base");

class Negosiasis extends BaseModel {
  constructor() {
    super("negosiasis");
  }

  async createNegosiasi(pengajuans_id, investor_id, status, id_terakhir_oleh) {
    try {
      const negosiasi = await this.knex(this.tableName)
        .insert({
          pengajuans_id,
          investor_id,
          status,
          id_terakhir_oleh,
        })
        .returning("*");
      return negosiasi;
    } catch (error) {
      throw error;
    }
  }

  async getNegosiasiById(id) {
    try {
      const knex = this.knex;
      const row = await this.knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.status",
          "negosiasis.id_terakhir_oleh",
          "negosiasis.created_at",
          "users.nama as investor_nama",
          "users.id as investor_id",
          "bisnis_owner.nama as bisnis_owner_nama",
          "bisnis_owner.id as bisnis_owner_id",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw("l.penawaran_return as last_penawaran_return"),
          knex.raw("l.catatan as last_catatan"),
          knex.raw("l.penawaran_nominal as last_penawaran_nominal"),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .join("users as bisnis_owner", "bisnis.user_id", "bisnis_owner.id")
        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        })
        .where("negosiasis.id", id)
        .first();

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
        investor: { id: row.investor_id, nama: row.investor_nama },
        bisnis_owner: { id: row.bisnis_owner_id, nama: row.bisnis_owner_nama },
        negosiasi_terakhir: row.last_penawaran_return
          ? {
              penawaran_return: row.last_penawaran_return,
              catatan: row.last_catatan,
              penawaran_nominal: row.last_penawaran_nominal,
            }
          : null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getNegosiasiByPengajuanId(pengajuans_id) {
    try {
      const knex = this.knex;
      const results = await knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.status",
          "negosiasis.id_terakhir_oleh",
          "negosiasis.created_at",
          "users.nama as investor_nama",
          "users.id as investor_id",
          "bisnis_owner.nama as bisnis_owner_nama",
          "bisnis_owner.id as bisnis_owner_id",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw("l.penawaran_return as last_penawaran_return"),
          knex.raw("l.catatan as last_catatan"),
          knex.raw("l.penawaran_nominal as last_penawaran_nominal"),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .join("users as bisnis_owner", "bisnis.user_id", "bisnis_owner.id")

        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        })
        .where("negosiasis.pengajuans_id", pengajuans_id);

      return results.map((row) => ({
        id: row.id,
        status: row.status,
        id_terakhir_oleh: row.id_terakhir_oleh,
        created_at: row.created_at,
        pengajuan: {
          id: row.pengajuan_id,
          target_pendanaan: row.target_pendanaan,
          per_anual_return: row.per_anual_return,
        },
        investor: { id: row.investor_id, nama: row.investor_nama },
        bisnis_owner: { id: row.bisnis_owner_id, nama: row.bisnis_owner_nama },
        negosiasi_terakhir: row.last_penawaran_return
          ? {
              penawaran_return: row.last_penawaran_return,
              catatan: row.last_catatan,
              penawaran_nominal: row.last_penawaran_nominal,
            }
          : null,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getAllNegosiasis(page = 1, limit = 10, status = "") {
    try {
      const knex = this.knex;
      const results = await knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.status",
          "negosiasis.id_terakhir_oleh",
          "negosiasis.created_at",
          "users.nama as investor_nama",
          "users.id as investor_id",
          "bisnis_owner.nama as bisnis_owner_nama",
          "bisnis_owner.id as bisnis_owner_id",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw("l.penawaran_return as last_penawaran_return"),
          knex.raw("l.catatan as last_catatan"),
          knex.raw("l.penawaran_nominal as last_penawaran_nominal"),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .join("users as bisnis_owner", "bisnis.user_id", "bisnis_owner.id")
        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        })
        .offset((page - 1) * limit)
        .limit(limit)
        .where("negosiasis.status", "ilike", `%${status}%`);

      return results.map((row) => ({
        id: row.id,
        status: row.status,
        id_terakhir_oleh: row.id_terakhir_oleh,
        created_at: row.created_at,
        pengajuan: {
          id: row.pengajuans_id,
          target_pendanaan: row.target_pendanaan,
          per_anual_return: row.per_anual_return,
        },
        investor: {
          id: row.investor_id,
          nama: row.investor_nama,
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
      }));
    } catch (error) {
      throw error;
    }
  }

  // src/models/negosiasis.js

  async getNegosiasiByUserId(user_id, role) {
    try {
      const knex = this.knex;
      const column =
        role === "investor" ? "negosiasis.investor_id" : "bisnis.user_id";

      const results = await knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.status",
          "negosiasis.id_terakhir_oleh",
          "negosiasis.created_at",
          "users.nama as investor_nama",
          "users.id as investor_id",
          "bisnis_owner.nama as bisnis_owner_nama",
          "bisnis_owner.id as bisnis_owner_id",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          "bisnis.id as bisnis_id",
          "bisnis.nama_bisnis",
          "bisnis.user_id as bisnis_user_id",
          knex.raw("l.penawaran_return as last_penawaran_return"),
          knex.raw("l.catatan as last_catatan"),
          knex.raw("l.penawaran_nominal as last_penawaran_nominal"),
        )

        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .join("users as bisnis_owner", "bisnis.user_id", "bisnis_owner.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        })
        .where(column, user_id);

      return results.map((row) => ({
        id: row.id,
        status: row.status,
        id_terakhir_oleh: row.id_terakhir_oleh,
        created_at: row.created_at,
        pengajuan: {
          id: row.pengajuan_id,
          target_pendanaan: row.target_pendanaan,
          per_anual_return: row.per_anual_return,
        },
        bisnis: {
          id: row.bisnis_id,
          nama: row.nama_bisnis,
          user_id: row.bisnis_user_id,
        },
        investor: {
          id: row.investor_id,
          nama: row.investor_nama,
        },
        bisnis_owner: {
          id: row.bisnis_owner_id,
          nama: row.bisnis_owner_nama,
        },
        negosiasi_terakhir: {
          penawaran_return: row.last_penawaran_return,
          catatan: row.last_catatan,
          penawaran_nominal: row.last_penawaran_nominal,
        },
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateNegosiasi(id, status, id_terakhir_oleh) {
    try {
      const negosiasi = await this.knex(this.tableName)
        .where("id", id)
        .update({
          status,
          id_terakhir_oleh,
        })
        .returning("*");
      return negosiasi;
    } catch (error) {
      throw error;
    }
  }

  async deleteNegosiasi(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Negosiasis();
