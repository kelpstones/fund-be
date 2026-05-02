const BaseModel = require("./base");

class PreferensiInvestor extends BaseModel {
  constructor() {
    super("preferensi_investor");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      tipe_usaha: row.tipe_usaha,
      level_usaha: row.level_usaha,
      range_penghasilan: row.range_penghasilan,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.investor_id,
        nama: row.user_nama,
        email: row.user_email,
      },
    };
  }

  #baseQuery() {
    return this.knex(this.tableName)
      .select(
        "preferensi_investor.id",
        "preferensi_investor.investor_id",
        "preferensi_investor.tipe_usaha",
        "preferensi_investor.level_usaha",
        "preferensi_investor.range_penghasilan",
        "preferensi_investor.created_at",
        "preferensi_investor.updated_at",
        "users.nama as user_nama",
        "users.email as user_email",
      )
      .leftJoin("users", "users.id", "preferensi_investor.investor_id");
  }

 
  async upsertPreferensi(id_user, data) {
    try {
      const existing = await this.knex(this.tableName)
        .where({ investor_id: id_user })
        .first();

      if (existing) {
        await this.knex(this.tableName)
          .where({ investor_id: id_user })
          .update({ ...data, updated_at: this.knex.fn.now() });
      } else {
        await this.knex(this.tableName).insert({ investor_id: id_user, ...data });
      }

      return await this.getByUserId(id_user);
    } catch (error) {
      throw error;
    }
  }

  async getByUserId(id_user) {
    try {
      const row = await this.#baseQuery()
        .where("preferensi_investor.investor_id", id_user)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async deleteByUserId(id_user) {
    try {
      await this.knex(this.tableName).where({ investor_id: id_user }).del();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PreferensiInvestor();
