const BaseModel = require("./base");

class Bisnis extends BaseModel {
  constructor() {
    super("bisnis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      nama_bisnis: row.nama_bisnis,
      email: row.email,
      alamat: row.alamat,
      no_telp: row.no_telp,
      deskripsi: row.deskripsi,
      kelas: {
        id: row.kelas_id,
        nama_kelas: row.kelas,
      },
      pemilik: {
        id: row.user_id,
        nama: row.pemilik,
        email: row.email_pemilik,
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "bisnis.id",
        "bisnis.nama_bisnis",
        "bisnis.email",
        "bisnis.kelas_id",
        "bisnis.alamat",
        "bisnis.no_telp",
        "bisnis.deskripsi",
        "kelas.nama_kelas as kelas",
        "users.nama as pemilik",
        "users.email as email_pemilik",
        "users.id as user_id",
      )
      .leftJoin("kelas", "bisnis.kelas_id", "kelas.id")
      .leftJoin("users", "bisnis.user_id", "users.id");
  }

  async createBisnis(nama, user_id, kelas_id, alamat, no_telp, email, deskripsi) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({ nama_bisnis: nama, user_id, kelas_id, alamat, no_telp, email, deskripsi })
        .returning("*");
      return this.#formatResponse(row); 
    } catch (error) {
      throw error;
    }
  }

  async getAllBisnis(page = 1, limit = 10, search = "") {
    try {
      const results = await this.#baseQuery()
        .where("bisnis.nama_bisnis", "ilike", `%${search}%`)
        .orderBy("bisnis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getBisnisById(id) {
    try {
      const row = await this.#baseQuery().where("bisnis.id", id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getBisnisByUserId(user_id) {
    try {
      const row = await this.#baseQuery().where("bisnis.user_id", user_id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getBisnisByEmail(email) {
    try {
      const row = await this.#baseQuery().where("bisnis.email", email).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async updateBisnis(id, nama, alamat, no_telp, email, deskripsi, kelas_id) {
    try {
      await this.knex(this.tableName).where({ id }).update({
        nama_bisnis: nama,
        kelas_id,
        alamat,
        no_telp,
        email,
        deskripsi,
        updated_at: this.knex.fn.now(),
      });
      return await this.getBisnisById(id);
    } catch (error) {
      throw error;
    }
  }

  async deleteBisnis(id) {
    try {
      await this.knex(this.tableName).where({ id }).del();
      return { message: "Bisnis berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Bisnis();