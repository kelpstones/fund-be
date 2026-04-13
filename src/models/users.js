const BaseModel = require("./index");

class User extends BaseModel {
  constructor() {
    super("users");
  }

  async createUser(name, email, password, role_id) {
    try {
      const [inserted] = await this.knex(this.tableName)
        .insert({ name, email, password, role_id })
        .returning(["id", "name", "email"]);

      const user = await this.knex(this.tableName)
        .select(
          "users.id",
          "users.name",
          "users.email",
          "roles.name as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where("users.id", inserted.id)
        .first();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, name, email, role_id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        name,
        email,
        role_id,
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
          "users.name",
          "users.email",
          "users.role_id",
          "users.created_at",
          "roles.name as role_name",
        )
        .leftJoin("roles", "users.role_id", "roles.id")
        .where("users.name", "like", `%${search}%`)
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
          "users.name",
          "users.email",
          "users.role_id",
          "users.created_at",
          "roles.name as role_name",
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
          "users.name",
          "users.email",
          "users.password",
          "users.role_id",
          "users.created_at",
          "roles.name as role_name",
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
