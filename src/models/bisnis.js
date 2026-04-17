const BaseModel = require("./base");

class Bisnis extends BaseModel {
  constructor() {
    super("bisnis");
  }

  async createBisnis(
    nama,
    user_id,
    kelas_id,
    alamat,
    no_telp,
    email,
    deskripsi,
  ) {
    try {
      const bisnis = await this.knex(this.tableName)
        .insert({
          nama_bisnis: nama,
          user_id,
          kelas_id,
          alamat,
          no_telp,
          email,
          deskripsi,
        })
        .returning([
          "id",
          "user_id",
          "kelas_id",
          "nama_bisnis",
          "alamat",
          "no_telp",
          "email",
          "deskripsi",
        ]);
      return bisnis;
    } catch (error) {
      throw error;
    }
  }

  async getAllBisnis(page = 1, limit = 10, search = "") {
    try {
      const bisnisList = await this.knex(this.tableName)
        .select(
          "bisnis.id",
          "bisnis.nama_bisnis",
          "bisnis.email",
          "kelas.nama_kelas as kelas",
          "bisnis.kelas_id",
          "bisnis.alamat",
          "bisnis.no_telp",
          "bisnis.deskripsi",
          "users.nama as pemilik",
          "users.email as email_pemilik",
          "users.id as user_id",
        )
        .leftJoin("users", "bisnis.user_id", "users.id")
        .leftJoin("kelas", "bisnis.kelas_id", "kelas.id")
        .offset((page - 1) * limit)
        .limit(limit)
        .where("bisnis.nama_bisnis", "ilike", `%${search}%`);

      // Mapping response
      return bisnisList.map((row) => ({
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
      }));
    } catch (error) {
      throw error;
    }
  }

  async getBisnisById(id) {
    try {
      const row = await this.knex(this.tableName)
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
        .leftJoin("users", "bisnis.user_id", "users.id")
        .where("bisnis.id", id)
        .first();

      if (!row) return null;
      return {
        id: row.id,
        nama_bisnis: row.nama_bisnis,
        email: row.email,
        alamat: row.alamat,
        no_telp: row.no_telp,
        deskripsi: row.deskripsi,
        kelas: { id: row.kelas_id, nama_kelas: row.kelas },
        pemilik: {
          id: row.user_id,
          nama: row.pemilik,
          email: row.email_pemilik,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getBisnisByUserId(user_id) {
    try {
      const row = await this.knex(this.tableName)
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
        .leftJoin("users", "bisnis.user_id", "users.id")
        .where("bisnis.user_id", user_id)
        .first();

      if (!row) return null;
      return {
        id: row.id,
        nama_bisnis: row.nama_bisnis,
        email: row.email,
        alamat: row.alamat,
        no_telp: row.no_telp,
        deskripsi: row.deskripsi,
        kelas: { id: row.kelas_id, nama_kelas: row.kelas },
        pemilik: {
          id: row.user_id,
          nama: row.pemilik,
          email: row.email_pemilik,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBisnisByEmail(email) {
    try {
      const row = await this.knex(this.tableName)
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
        .leftJoin("users", "bisnis.user_id", "users.id")
        .where("bisnis.email", email)
        .first();

      if (!row) return null;
      return {
        id: row.id,
        nama_bisnis: row.nama_bisnis,
        email: row.email,
        alamat: row.alamat,
        no_telp: row.no_telp,
        deskripsi: row.deskripsi,
        kelas: { id: row.kelas_id, nama_kelas: row.kelas },
        pemilik: {
          id: row.user_id,
          nama: row.pemilik,
          email: row.email_pemilik,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  updateBisnis(id, nama, alamat, no_telp, email, deskripsi, kelas_id) {
    try {
      const bisnis = this.knex(this.tableName).where({ id }).update({
        nama_bisnis: nama,
        kelas_id: kelas_id,
        alamat: alamat,
        no_telp: no_telp,
        email: email,
        deskripsi: deskripsi,
      });
      return bisnis;
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
