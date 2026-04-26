const BaseModel = require("./base");

const CLASS_MAP = {
  0: "Critical",
  1: "Struggling",
  2: "Growth",
  3: "Elite",
};

class BisnisProfiles extends BaseModel {
  constructor() {
    super("bisnis_profiles");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      net_profit_margin: row.net_profit_margin,
      kepuasan_pelanggan: row.kepuasan_pelanggan,
      peak_hour_latency: row.peak_hour_latency,
      review_volatility: row.review_volatility,
      repeat_order_rate: row.repeat_order_rate,
      digital_adoption_score: row.digital_adoption_score,
     
      year_revenue: row.year_revenue,
      business_tenure_years: row.business_tenure_years,
      class: row.class,
      class_label: CLASS_MAP[row.class] ?? "Critical",
      created_at: row.created_at,
      updated_at: row.updated_at,
      bisnis: {
        id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
      },
    };
  }

  async upsertProfile(bisnis_id, data) {
    try {
      const existing = await this.knex(this.tableName)
        .where({ bisnis_id })
        .first();

      if (existing) {
        await this.knex(this.tableName)
          .where({ bisnis_id })
          .update({ ...data, updated_at: this.knex.fn.now() });
      } else {
        await this.knex(this.tableName).insert({ bisnis_id, ...data });
      }

      return await this.getProfileByBisnisId(bisnis_id);
    } catch (error) {
      throw error;
    }
  }

  async updateClass(bisnis_id, classValue) {
    try {
      await this.knex(this.tableName)
        .where({ bisnis_id })
        .update({ class: classValue, updated_at: this.knex.fn.now() });

      return await this.getProfileByBisnisId(bisnis_id);
    } catch (error) {
      throw error;
    }
  }

  async getProfileByBisnisId(bisnis_id) {
    try {
      const row = await this.knex(this.tableName)
        .select("bisnis_profiles.*", "bisnis.nama_bisnis")
        .join("bisnis", "bisnis_profiles.bisnis_id", "bisnis.id")
        .where("bisnis_profiles.bisnis_id", bisnis_id)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BisnisProfiles();