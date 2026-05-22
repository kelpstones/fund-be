const BaseModel = require("./base");

class Transaksi extends BaseModel {
  constructor() {
    super("transaksis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      external_id: row.external_id,
      tipe: row.tipe,
      jumlah: parseFloat(row.jumlah || 0),
      status: row.status,
      deskripsi: row.deskripsi,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: row.nama_user
        ? {
            id: row.user_id,
            nama: row.nama_user,
            email: row.email_user,
          }
        : null,
    };
  }

  #baseQuery(trx = this.knex) {
    return trx(this.tableName)
      .select(
        "transaksis.*",
        "users.nama as nama_user",
        "users.email as email_user"
      )
      .leftJoin("users", "transaksis.user_id", "users.id");
  }

  async createTransaksi(data, trx = this.knex) {
    try {
      const [inserted] = await trx(this.tableName)
        .insert({
          user_id: data.user_id,
          external_id: data.external_id,
          tipe: data.tipe,
          jumlah: data.jumlah,
          status: data.status || "pending",
          deskripsi: data.deskripsi,
        })
        .returning("id");

      return await this.getTransaksiById(inserted.id, trx);
    } catch (error) {
      throw error;
    }
  }

  async getTransaksiById(id, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx)
        .where("transaksis.id", id)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getTransaksiByExternalId(external_id, trx = this.knex) {
    try {
      const row = await this.#baseQuery(trx)
        .where("transaksis.external_id", external_id)
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getTransaksisByUserId(
    user_id,
    page = 1,
    limit = 10,
    trx = this.knex
  ) {
    try {
      const offset = (page - 1) * limit;

      const dataQuery = this.#baseQuery(trx)
        .where("transaksis.user_id", user_id)
        .orderBy("transaksis.created_at", "desc")
        .offset(offset)
        .limit(limit);

      const countQuery = trx(this.tableName)
        .where("user_id", user_id)
        .count("id as total")
        .first();

      const [rows, countResult] = await Promise.all([dataQuery, countQuery]);
      const total = parseInt(countResult.total || 0);

      return {
        data: rows.map((r) => this.#formatResponse(r)),
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

  async getAllTransaksis(
    filters = {},
    page = 1,
    limit = 10,
    trx = this.knex
  ) {
    try {
      const offset = (page - 1) * limit;

      let dataQuery = this.#baseQuery(trx)
        .orderBy("transaksis.created_at", "desc")
        .offset(offset)
        .limit(limit);

      let countQuery = trx(this.tableName).count("id as total").first();

      if (filters.tipe) {
        dataQuery = dataQuery.where("transaksis.tipe", filters.tipe);
        countQuery = countQuery.where("tipe", filters.tipe);
      }
      if (filters.status) {
        dataQuery = dataQuery.where("transaksis.status", filters.status);
        countQuery = countQuery.where("status", filters.status);
      }

      const [rows, countResult] = await Promise.all([dataQuery, countQuery]);
      const total = parseInt(countResult.total || 0);

      return {
        data: rows.map((r) => this.#formatResponse(r)),
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

  async updateStatus(id, status, trx = this.knex) {
    try {
      await trx(this.tableName)
        .where({ id })
        .update({
          status,
          updated_at: trx.fn.now(),
        });
      return await this.getTransaksiById(id, trx);
    } catch (error) {
      throw error;
    }
  }

  async updateStatusByExternalId(external_id, status, trx = this.knex) {
    try {
      await trx(this.tableName)
        .where({ external_id })
        .update({
          status,
          updated_at: trx.fn.now(),
        });
      return await this.getTransaksiByExternalId(external_id, trx);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Transaksi();
