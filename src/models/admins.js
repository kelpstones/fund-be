const BaseModel = require("./base");

class Admin extends BaseModel {
  constructor() {
    super("admins");
  }

  async createAdmin(name, email, password, no_telp, level) {
    try {
      const admin = await this.knex(this.tableName)
        .insert({ name, email, password, no_telp, level })
        .returning(["id", "name", "email", "no_telp", "level"]);
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
          "admins.name",
          "admins.email",
          "admins.no_telp",
          "admins.level",
          "admins.created_at",
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .where("admins.name", "ilike", `%${search}%`);
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
          "admins.name",
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
          "admins.name",
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

  async updateAdmin(id, name, email, no_telp, level) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        name,
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