const BaseModel = require("./base");

class User extends BaseModel {
  constructor() {
    super("users");
  }

  async createUser(nama, email, password, nik, role_id) {
    try {
      const [inserted] = await this.knex(this.tableName)
        .insert({ nama, email, password, nik, role_id })
        .returning(["id", "nama", "email"]);

      const user = await this.knex(this.tableName)
        .select(
          "users.id",
          "users.nama",
          "users.email",
          "users.nik",
          "roles.nama as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where("users.id", inserted.id)
        .first();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, nama, email) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        nama,
        email,
      });
      return data;
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
      const users = await this.knex(this.tableName)
        .select(
          "users.id",
          "users.nama",
          "users.email",
          "users.role_id",
          "users.created_at",
          "roles.nama as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where("users.nama", "like", `%${search}%`)
        .offset((page - 1) * limit)
        .limit(limit);
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await this.knex(this.tableName)
        .select(
          "users.id",
          "users.nama",
          "users.email",
          "users.role_id",
          "users.created_at",
          "roles.nama as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where({ "users.id": id })
        .first();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.knex(this.tableName)
        .select(
          "users.id",
          "users.nama",
          "users.email",
          "users.password",
          "users.role_id",
          "users.created_at",
          "roles.nama as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where({ "users.email": email })
        .first();
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new User();
