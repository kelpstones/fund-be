const BaseModel = require("./base");

class SupportedBank extends BaseModel {
  constructor() {
    super("supported_banks");
  }

  async getAllActive(trx = this.knex) {
    try {
      return await trx(this.tableName)
        .where({ is_active: true })
        .orderBy("type", "asc")
        .orderBy("code", "asc");
    } catch (error) {
      throw error;
    }
  }

  async getById(id, trx = this.knex) {
    try {
      return await trx(this.tableName).where({ id }).first();
    } catch (error) {
      throw error;
    }
  }

  async getByCode(code, trx = this.knex) {
    try {
      return await trx(this.tableName).where({ code }).first();
    } catch (error) {
      throw error;
    }
  }

  async create(data, trx = this.knex) {
    try {
      const [inserted] = await trx(this.tableName)
        .insert({
          code: data.code,
          name: data.name,
          type: data.type,
          is_active: data.is_active !== undefined ? data.is_active : true,
          logo_url: data.logo_url || null,
        })
        .returning("*");
      return inserted;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data, trx = this.knex) {
    try {
      const [updated] = await trx(this.tableName)
        .where({ id })
        .update({
          ...data,
          updated_at: trx.fn.now(),
        })
        .returning("*");
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async delete(id, trx = this.knex) {
    try {
      const deleted = await trx(this.tableName).where({ id }).del();
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  }

  async getAll(page = 1, limit = 10, search = "", trx = this.knex) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${search}%`;

      const dataQuery = trx(this.tableName)
        .where(function () {
          this.where("code", "ilike", searchPattern).orWhere(
            "name",
            "ilike",
            searchPattern
          );
        })
        .orderBy("code", "asc")
        .offset(offset)
        .limit(limit);

      const countQuery = trx(this.tableName)
        .where(function () {
          this.where("code", "ilike", searchPattern).orWhere(
            "name",
            "ilike",
            searchPattern
          );
        })
        .count("id as total")
        .first();

      const [rows, countResult] = await Promise.all([dataQuery, countQuery]);
      const total = parseInt(countResult.total || 0);

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SupportedBank();
