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
      const negosiasi = await this.knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.pengajuans_id",
          "negosiasis.investor_id",
          "negosiasis.status",
          "users.nama as investor_nama",
          "negosiasis.id_terakhir_oleh",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw(
            "l.penawaran_return as last_penawaran_return, l.catatan as last_catatan",
          ),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
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
        .where("negosiasis.id", id)
        .first();
      return negosiasi;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  async getNegosiasiById(id) {
    try {
      const knex = this.knex
      const negosiasi = await this.knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.pengajuans_id",
          "negosiasis.investor_id",
          "negosiasis.status",
          "users.nama as investor_nama",
          "negosiasis.id_terakhir_oleh",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .where("negosiasis.id", id)
        .first();
      return negosiasi;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }

  async getNegosiasiByUserId(user_id, role) {
    try {
      const knex = this.knex;
      const column =
        role === "investor" ? "negosiasis.investor_id" : "pengajuans.user_id";
      const negosiasi = await knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.pengajuans_id",
          "negosiasis.investor_id",
          "negosiasis.status",
          "users.nama as investor_nama",
          "negosiasis.id_terakhir_oleh",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw(
            "l.penawaran_return as last_penawaran_return, l.catatan as last_catatan",
          ),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        }).where(column, user_id);
      return negosiasi;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getNegosiasiByPengajuanId(pengajuans_id) {
    try {
      const knex = this.knex;
      const negosiasi = await knex(this.tableName)
        .where("pengajuans_id", pengajuans_id)
        .select(
          "negosiasis.id",
          "negosiasis.pengajuans_id",
          "negosiasis.investor_id",
          "negosiasis.status",
          "users.nama as investor_nama",
          "negosiasis.id_terakhir_oleh",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
          knex.raw(
            "l.penawaran_return as last_penawaran_return, l.catatan as last_catatan",
          ),
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .leftJoin("log_negosiasis as l", function () {
          this.on("negosiasis.id", "l.negosiasi_id").andOn(
            "l.created_at",
            "=",
            knex.raw(
              "(SELECT MAX(created_at) FROM log_negosiasis WHERE negosiasi_id = negosiasis.id)",
            ),
          );
        }).first();
      return negosiasi;
    } catch (error) {
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

  async getAllNegosiasi(page = 1, limit = 10) {
    try {
      const negosiasis = await this.knex(this.tableName)
        .select(
          "negosiasis.id",
          "negosiasis.pengajuans_id",
          "negosiasis.investor_id",
          "negosiasis.status",
          "users.nama as investor_nama",
          "negosiasis.id_terakhir_oleh",
          "pengajuans.target_pendanaan",
          "pengajuans.per_anual_return",
        )
        .join("pengajuans", "negosiasis.pengajuans_id", "pengajuans.id")
        .join("users", "negosiasis.investor_id", "users.id")
        .offset((page - 1) * limit)
        .limit(limit);
      return negosiasis;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Negosiasis();
