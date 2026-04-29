class Personalisasi extends BaseModel {
  constructor() {
    super("personalisasi");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      skor_kecocokan: row.skor_kecocokan,
      matched_class: row.matched_class,
      matched_at: row.matched_at,
      bisnis: {
        id: row.bisnis_id,
        nama_bisnis: row.bisnis_nama,
        alamat: row.bisnis_alamat,
        deskripsi: row.bisnis_deskripsi,
        kelas: {
          id: row.kelas_id,
          nama_kelas: row.kelas_nama,
        },
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "personalisasi.id",
        "personalisasi.investor_id",
        "personalisasi.bisnis_id",
        "personalisasi.skor_kecocokan",
        "personalisasi.matched_class",
        "personalisasi.matched_at",
        "bisnis.id as bisnis_id",
        "bisnis.nama_bisnis as bisnis_nama",
        "bisnis.alamat as bisnis_alamat",
        "bisnis.deskripsi as bisnis_deskripsi",
        "kelas.id as kelas_id",
        "kelas.nama_kelas as kelas_nama",
      )
      .leftJoin("bisnis", "bisnis.id", "personalisasi.bisnis_id")
      .leftJoin("kelas", "kelas.id", "bisnis.kelas_id");
  }

 
  async upsertBatch(id_user, results = []) {
    try {
     
      await this.knex(this.tableName).where({ investor_id: id_user }).del();

      if (results.length === 0) return [];

      await this.knex(this.tableName).insert(
        results.map((r) => ({
          investor_id: id_user,
          bisnis_id: r.id_bisnis,
          skor_kecocokan: r.skor_kecocokan,
          matched_class: r.matched_class ?? null,
          matched_at: this.knex.fn.now(),
        }))
      );

      return await this.getByUserId(id_user);
    } catch (error) {
      throw error;
    }
  }

  
  async getByUserId(id_user, limit = 10) {
    try {
      const rows = await this.#baseQuery()
        .where("personalisasi.investor_id", id_user)
        .orderBy("personalisasi.skor_kecocokan", "desc")
        .limit(limit);

      return rows.map((r) => this.#formatResponse(r));
    } catch (error) {
      throw error;
    }
  }

 
  async getByBisnisId(id_bisnis, limit = 10) {
    try {
      const rows = await this.knex(this.tableName)
        .select(
          "personalisasi.id",
          "personalisasi.skor_kecocokan",
          "personalisasi.matched_at",
          "users.id as user_id",
          "users.nama as user_nama",
          "users.email as user_email",
        )
        .leftJoin("users", "users.id", "personalisasi.investor_id")
        .where("personalisasi.bisnis_id", id_bisnis)
        .orderBy("personalisasi.skor_kecocokan", "desc")
        .limit(limit);

      return rows.map((r) => ({
        id: r.id,
        skor_kecocokan: r.skor_kecocokan,
        matched_at: r.matched_at,
        investor: {
          id: r.user_id,
          nama: r.user_nama,
          email: r.user_email,
        },
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Personalisasi();