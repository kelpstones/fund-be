const BaseModel = require("./base");

class Admin extends BaseModel {
  constructor() {
    super("admins");
  }

  async createAdmin(nama, email, password, no_telp, level) {
    try {
      const admin = await this.knex(this.tableName)
        .insert({
          nama: nama,
          email: email,
          password: password,
          no_telp: no_telp,
          level: level,
        })
        .returning(["id", "nama", "email", "no_telp", "level"]);
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async getAllAdmins(page = 1, limit = 10, search = "") {
    try {
      const admins = await this.knex(this.tableName)
        .select(
          "admins.id",
          "admins.nama",
          "admins.email",
          "admins.no_telp",
          "admins.level",
          "admins.created_at",
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .where("admins.nama", "ilike", `%${search}%`);
      return admins;
    } catch (error) {
      throw error;
    }
  }

  async getAdminByEmail(email) {
    try {
      const admin = await this.knex(this.tableName)
        .select(
          "admins.id",
          "admins.nama",
          "admins.email",
          "admins.password",
          "admins.no_telp",
          "admins.level",
        )
        .where({ email })
        .first();
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async getAdminById(id) {
    try {
      const admin = await this.knex(this.tableName)
        .select(
          "admins.id",
          "admins.nama",
          "admins.email",
          "admins.no_telp",
          "admins.level",
        )
        .where({ id })
        .first();
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async updateAdmin(id, nama, email, no_telp, level) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        nama,
        email,
        no_telp,
        level,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAdmin(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Admin();
