const BaseModel = require("./base");

const CLASS_MAP = {
  0: "Critical",
  1: "Struggling",
  2: "Growth",
  3: "Elite",
};

class Bisnis extends BaseModel {
  constructor() {
    super("bisnis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      nama_bisnis: row.nama_bisnis,
      tipe_usaha: row.tipe_usaha,
      email: row.email,
      alamat: row.alamat,
      no_telp: row.no_telp,
      deskripsi: row.deskripsi,
      created_at: row.created_at,
      class_label: CLASS_MAP[row.class] ?? "Critical",
      covers: row.covers || [],
      is_verified: row.is_verified,
      verified_at: row.verified_at,
      kelas: {
        id: row.kelas_id,
        nama_kelas: row.kelas,
      },
      profile: {
        net_profit_margin: row.net_profit_margin,
        kepuasan_pelanggan: row.kepuasan_pelanggan,
        review_volatility: row.review_volatility,
        repeat_order_rate: row.repeat_order_rate,
        digital_adoption_score: row.digital_adoption_score,
        year_revenue: row.year_revenue,
        business_tenure_years: row.business_tenure_years,
        tim_operasional: row.tim_operasional,
      },
      docs: row.docs || [],
      pemilik: {
        id: row.user_id,
        nama: row.pemilik,
        email: row.email_pemilik,
      },
    };
  }

  #baseQuery(role = null) {
    const allowedDocs =
      role === "superadmin" || role === "admin"
        ? "('proposal_pendanaan', 'laporan_penjualan', 'legalitas_usaha')"
        : "('proposal_pendanaan', 'laporan_penjualan')";

    return this.knex(this.tableName)
      .select(
        "bisnis.id",
        "bisnis.nama_bisnis",
        "bisnis.tipe_usaha",
        "bisnis.email",
        "bisnis.kelas_id",
        "bisnis.alamat",
        "bisnis.no_telp",
        "bisnis.deskripsi",
        "bisnis.is_verified",
        "bisnis.verified_at",
        "bisnis.created_at",
        "bisnis_profiles.class as class",
        "bisnis_profiles.net_profit_margin",
        "bisnis_profiles.kepuasan_pelanggan",
        "bisnis_profiles.review_volatility",
        "bisnis_profiles.repeat_order_rate",
        "bisnis_profiles.digital_adoption_score",
        "bisnis_profiles.year_revenue",
        "bisnis_profiles.business_tenure_years",
        "bisnis_profiles.tim_operasional",
        "bisnis_profiles.updated_at as profile_updated_at",
        this.knex.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', bisnis_cover.id,
              'image_url', bisnis_cover.image_url,
              'urutan', bisnis_cover.urutan
            ) ORDER BY bisnis_cover.urutan ASC
          ) FILTER (WHERE bisnis_cover.id IS NOT NULL),
          '[]'
        ) as covers
      `),
        this.knex.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', dokumen_bisnis.id,
              'jenis_dokumen', dokumen_bisnis.jenis_dokumen,
              'nama_dokumen', dokumen_bisnis.nama_dokumen,
              'file_url', dokumen_bisnis.file_url,
              'created_at', dokumen_bisnis.created_at
            ) ORDER BY dokumen_bisnis.created_at ASC
          ) FILTER (
            WHERE dokumen_bisnis.id IS NOT NULL
            AND dokumen_bisnis.jenis_dokumen IN ${allowedDocs}
          ),
          '[]'
        ) as docs
      `),

        "kelas.nama_kelas as kelas",
        "users.nama as pemilik",
        "users.email as email_pemilik",
        "users.id as user_id",
      )
      .leftJoin("kelas", "bisnis.kelas_id", "kelas.id")
      .leftJoin("bisnis_profiles", "bisnis.id", "bisnis_profiles.bisnis_id")
      .leftJoin("users", "bisnis.user_id", "users.id")
      .leftJoin("bisnis_cover", "bisnis.id", "bisnis_cover.bisnis_id")
      .leftJoin("dokumen_bisnis", "bisnis.id", "dokumen_bisnis.bisnis_id")
      .groupBy(
        "bisnis.id",
        "bisnis_profiles.class",
        "bisnis_profiles.net_profit_margin",
        "bisnis_profiles.kepuasan_pelanggan",
        "bisnis_profiles.review_volatility",
        "bisnis_profiles.repeat_order_rate",
        "bisnis_profiles.digital_adoption_score",
        "bisnis_profiles.year_revenue",
        "bisnis_profiles.business_tenure_years",
        "bisnis_profiles.tim_operasional",
        "bisnis_profiles.updated_at",
        "kelas.nama_kelas",
        "users.nama",
        "users.email",
        "users.id",
      );
  }

  async createBisnis(
    nama,
    tipe_usaha,
    user_id,
    kelas_id,
    alamat,
    no_telp,
    email,
    deskripsi,
  ) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({
          nama_bisnis: nama,
          tipe_usaha: tipe_usaha,
          user_id,
          kelas_id,
          alamat,
          no_telp,
          email,
          deskripsi,
        })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getAllBisnis(page = 1, limit = 10, search = "") {
    try {
      const results = await this.#baseQuery("admin")
        .where("bisnis.nama_bisnis", "ilike", `%${search}%`)
        .orderBy("bisnis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getAllBisnisForInvestor(page = 1, limit = 10, search = "") {
    try {
      const results = await this.#baseQuery("investor")
        .where("bisnis.nama_bisnis", "ilike", `%${search}%`)
        .where("bisnis.is_verified", true)
        .orderBy("bisnis.created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit);
      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getBisnisById(id, role = null, trx = this.knex) {
    try {
      const row = await this.#baseQuery(role).where("bisnis.id", id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getBisnisByIdForInvestor(id) {
    try {
      const row = await this.#baseQuery("investor")
        .where("bisnis.id", id)
        .where("bisnis.is_verified", true)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getBisnisByUserId(user_id) {
    try {
      const row = await this.#baseQuery("admin")
        .where("bisnis.user_id", user_id)
        .first();
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

  async updateBisnis(
    id,
    nama,
    tipe_usaha,
    alamat,
    no_telp,
    email,
    deskripsi,
    kelas_id,
  ) {
    try {
      await this.knex(this.tableName).where({ id }).update({
        nama_bisnis: nama,
        tipe_usaha,
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

  async updateVerifikasi(id) {
    try {
      await this.knex(this.tableName).where({ id }).update({
        is_verified: true,
        verified_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });
      return await this.getBisnisById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateCoverImage(id, cover_image_url) {
    try {
      await this.knex(this.tableName).where({ id }).update({
        cover_image_url,
        updated_at: this.knex.fn.now(),
      });
      return await this.getBisnisById(id);
    } catch (error) {
      throw error;
    }
  }

  async canDelete(id, trx = this.knex) {
    try {
      const activeFunding = await trx("pengajuans")
        .where("bisnis_id", id)
        .whereIn("status", ["negotiating", "waiting_payment", "funded"])
        .first();

      const hasInvestments = await trx("investasis")
        .join("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
        .where("pengajuans.bisnis_id", id)
        .first();

      return !activeFunding && !hasInvestments;
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
