const BaseModel = require("./base");

class Bookmark extends BaseModel {
  constructor() {
    super("bookmarks");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.bookmark_id,
      saved_at: row.saved_at,
      bisnis: {
        id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
        tipe_usaha: row.tipe_usaha,
        deskripsi: row.deskripsi,
        alamat: row.alamat,
        no_telp: row.no_telp,
        email: row.email_bisnis,
        kelas: {
          id: row.kelas_id,
          nama_kelas: row.nama_kelas,
        },
        pemilik: {
          id: row.user_id,
          nama: row.nama_pemilik,
        },
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "bookmarks.id as bookmark_id",
        "bookmarks.created_at as saved_at",
        "bisnis.id as bisnis_id",
        "bisnis.nama_bisnis",
        "bisnis.tipe_usaha",
        "bisnis.deskripsi",
        "bisnis.alamat",
        "bisnis.no_telp",
        "bisnis.email as email_bisnis",
        "bisnis.kelas_id",
        "kelas.nama_kelas",
        "users.id as user_id",
        "users.nama as nama_pemilik",
      )
      .leftJoin("bisnis", "bookmarks.bisnis_id", "bisnis.id")
      .leftJoin("kelas", "bisnis.kelas_id", "kelas.id")
      .leftJoin("users", "bisnis.user_id", "users.id");
  }

  async createBookmark(investor_id, bisnis_id) {
    try {
      const existing = await this.knex(this.tableName)
        .where({ investor_id, bisnis_id })
        .first();

      if (existing) {
        const err = new Error("Bookmark already exists");
        err.status = 409;
        throw err;
      }

      const [row] = await this.knex(this.tableName)
        .insert({ investor_id, bisnis_id })
        .returning("*");

      return row;
    } catch (error) {
      throw error;
    }
  }

  async getBookmarksByInvestor(investor_id, page = 1, limit = 10) {
    try {
      const rows = await this.#baseQuery()
        .where("bookmarks.investor_id", investor_id)
        .offset((page - 1) * limit)
        .limit(limit);
      return rows.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async deleteBookmark(investor_id, bisnis_id) {
    try {
      const deleted = await this.knex(this.tableName)
        .where({ investor_id, bisnis_id })
        .del();
      if (!deleted) {
        const err = new Error("Bookmark not found");
        err.status = 404;
        throw err;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async isBookmarked(investor_id, bisnis_id) {
    try {
      const bookmark = await this.knex(this.tableName)
        .where({ investor_id, bisnis_id })
        .first();
      return !!bookmark;
    } catch (error) {
      throw error;
    }
  }
}
