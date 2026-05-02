const BaseModel = require("./base");

class User extends BaseModel {
  constructor() {
    super("users");
  }

  #formatResponse(row, options = {}) {
    if (!row) return null;

    const {
      includePassword = false,
      includeNik = false,
      includeTelp = false,
      includeBisnis = false,
    } = options;

    const data = {
      id: row.id,
      nama: row.nama,
      email: row.email,
      is_onboarded: row.is_onboarded,
      created_at: row.created_at,
      updated_at: row.updated_at,
      email_verified: row.email_verified,
      role: {
        id: row.role_id,
        nama_role: row.role_name,
      },
    };

    if (includeNik) data.nik = row.nik;
    if (includeTelp) data.no_telp = row.no_telp;
    if (includePassword) data.password = row.password;

    if (includeBisnis) {
      data.bisnis = row.bisnis_id
        ? {
            id: row.bisnis_id,
            nama_bisnis: row.bisnis_nama,
            tipe_usaha: row.bisnis_tipe_usaha,
            email: row.bisnis_email,
            no_telp: row.bisnis_no_telp,
            alamat: row.bisnis_alamat,
            deskripsi: row.bisnis_deskripsi,
            kelas: {
              id: row.kelas_id,
              nama_kelas: row.kelas_nama,
            },
          }
        : null;
    }

    return data;
  }

  #baseQuery(withBisnis = false) {
    const query = this.knex(this.tableName)
      .select(
        "users.id",
        "users.nama",
        "users.email",
        "users.password",
        "users.nik",
        "users.no_telp",
        "users.role_id",
        "users.is_onboarded",
        "users.created_at",
        "users.email_verified",
        "users.updated_at",
        "roles.nama as role_name",
      )
      .leftJoin("roles", "users.role_id", "roles.id");

    if (withBisnis) {
      query
        .select(
          "bisnis.id as bisnis_id",
          "bisnis.nama_bisnis as bisnis_nama",
          "bisnis.tipe_usaha as bisnis_tipe_usaha",
          "bisnis.email as bisnis_email",
          "bisnis.no_telp as bisnis_no_telp",
          "bisnis.alamat as bisnis_alamat",
          "bisnis.deskripsi as bisnis_deskripsi",
          "kelas.id as kelas_id",
          "kelas.nama_kelas as kelas_nama",
        )
        .leftJoin("bisnis", "bisnis.user_id", "users.id")
        .leftJoin("kelas", "kelas.id", "bisnis.kelas_id");
    }

    return query;
  }

  async createUser(
    nama,
    email,
    password,
    nik,
    no_telp,
    role_id,
    trx = this.knex,
  ) {
    try {
      const [inserted] = await trx(this.tableName)
        .insert({ nama, email, password, nik, no_telp, role_id })
        .returning("id");

      return await this.getUserById(inserted.id);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      await this.knex(this.tableName)
        .where({ id })
        .update({ ...data, updated_at: this.knex.fn.now() });

      return await this.getUserById(id);
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id, newPassword, trx = this.knex) {
    try {
      await trx(this.tableName)
        .where({ id })
        .update({ password: newPassword, updated_at: this.knex.fn.now() });
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await this.knex(this.tableName).where({ id }).del();
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(page = 1, limit = 10, search = "") {
    try {
      const rows = await this.#baseQuery()
        .where("users.nama", "like", `%${search}%`)
        .orWhere("users.email", "like", `%${search}%`)
        .offset((page - 1) * limit)
        .limit(limit);

      const [{ total }] = await this.knex(this.tableName)
        .count("id as total")
        .where("nama", "like", `%${search}%`)
        .orWhere("email", "like", `%${search}%`);

      return {
        data: rows.map((r) => this.#formatResponse(r)),
        pagination: {
          page,
          limit,
          total: parseInt(total),
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const row = await this.#baseQuery().where("users.id", id).first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  // Profile untuk role umkm — include bisnis & kelas
  async getUserProfile(id) {
    try {
      const row = await this.#baseQuery(true).where("users.id", id).first();
      return this.#formatResponse(row, {
        includeTelp: true,
        includeBisnis: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // Profile untuk role investor — include riwayat investasi
  async getUserProfileInvestor(id) {
    try {
      const row = await this.#baseQuery().where("users.id", id).first();
      if (!row) return null;

      const investasis = await this.knex("investasis")
        .select(
          "investasis.id",
          "investasis.nominal_investasi",
          "investasis.return_investasi",
          "investasis.created_at",
          "pengajuans.id as pengajuan_id",
          "pengajuans.status as pengajuan_status",
          "pengajuans.target_pendanaan",
          "bisnis.nama_bisnis",
          "bisnis.tipe_usaha as bisnis_tipe_usaha",
        )
        .leftJoin("pengajuans", "pengajuans.id", "investasis.pengajuans_id")
        .leftJoin("bisnis", "bisnis.id", "pengajuans.bisnis_id")
        .where("investasis.investor_id", id);

      const total_investasi = investasis.reduce(
        (sum, i) => sum + parseInt(i.nominal_investasi || 0),
        0,
      );

      const result = this.#formatResponse(row);
      result.investasi = investasis;
      result.total_investasi = total_investasi;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const row = await this.#baseQuery().where("users.email", email).first();
      return this.#formatResponse(row, {
        includePassword: true,
        includeNik: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserByNik(nik) {
    try {
      const row = await this.#baseQuery().where("users.nik", nik).first();
      return this.#formatResponse(row, { includeNik: true });
    } catch (error) {
      throw error;
    }
  }

  async getUserByNoTelp(no_telp) {
    try {
      const row = await this.#baseQuery()
        .where("users.no_telp", no_telp)
        .first();
      return this.#formatResponse(row, { includeTelp: true });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new User();
