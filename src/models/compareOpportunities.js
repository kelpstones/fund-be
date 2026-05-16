const BaseModel = require("./base");

const CLASS_MAP = {
  0: "Critical",
  1: "Struggling",
  2: "Growth",
  3: "Elite",
};

class CompareOpportunities extends BaseModel {
  constructor() {
    super("pengajuans");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      pengajuan_id: row.pengajuan_id,
      status: row.status,
      target_pendanaan: row.target_pendanaan,
      total_pendanaan: row.total_pendanaan,
      per_anual_return: row.per_anual_return,
      progress_persen:
        row.target_pendanaan > 0
          ? parseFloat(
              ((row.total_pendanaan / row.target_pendanaan) * 100).toFixed(2)
            )
          : 0,
      bisnis: {
        id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
        tipe_usaha: row.tipe_usaha,
        deskripsi: row.deskripsi,
        alamat: row.alamat,
        kelas: {
          id: row.kelas_id,
          nama_kelas: row.nama_kelas,
        },
        pemilik: {
          id: row.user_id,
          nama: row.nama_pemilik,
        },
      },
      profile: row.profile_id
        ? {
            net_profit_margin: row.net_profit_margin,
            kepuasan_pelanggan: row.kepuasan_pelanggan,
            peak_hour_latency: row.peak_hour_latency,
            review_volatility: row.review_volatility,
            repeat_order_rate: row.repeat_order_rate,
            digital_adoption_score: row.digital_adoption_score,
            year_revenue: row.year_revenue,
            business_tenure_years: row.business_tenure_years,
            class: row.bp_class,
            class_label: CLASS_MAP[row.bp_class] ?? "Critical",
          }
        : null,
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "pengajuans.id as pengajuan_id",
        "pengajuans.status",
        "pengajuans.target_pendanaan",
        "pengajuans.total_pendanaan",
        "pengajuans.per_anual_return",
        "bisnis.id as bisnis_id",
        "bisnis.nama_bisnis",
        "bisnis.tipe_usaha",
        "bisnis.deskripsi",
        "bisnis.alamat",
        "bisnis.kelas_id",
        "kelas.nama_kelas",
        "users.id as user_id",
        "users.nama as nama_pemilik",
        "bisnis_profiles.id as profile_id",
        "bisnis_profiles.net_profit_margin",
        "bisnis_profiles.kepuasan_pelanggan",
        "bisnis_profiles.peak_hour_latency",
        "bisnis_profiles.review_volatility",
        "bisnis_profiles.repeat_order_rate",
        "bisnis_profiles.digital_adoption_score",
        "bisnis_profiles.year_revenue",
        "bisnis_profiles.business_tenure_years",
        "bisnis_profiles.class as bp_class"
      )
      .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
      .leftJoin("kelas", "bisnis.kelas_id", "kelas.id")
      .leftJoin("users", "bisnis.user_id", "users.id")
      .leftJoin("bisnis_profiles", "bisnis.id", "bisnis_profiles.bisnis_id");
  }

  async compareByIds(ids = []) {
    try {
      if (ids.length < 2) {
        const err = new Error("Minimal 2 pengajuan harus dipilih untuk dibandingkan");
        err.status = 400;
        throw err;
      }

      if (ids.length > 4) {
        const err = new Error("Maksimal 4 pengajuan dapat dibandingkan sekaligus");
        err.status = 400;
        throw err;
      }

      const rows = await this.#baseQuery()
        .whereIn("pengajuans.id", ids)
        .where("pengajuans.status", "published");

      if (!rows.length) {
        const err = new Error("Tidak ada pengajuan yang ditemukan");
        err.status = 404;
        throw err;
      }

      return rows.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CompareOpportunities();