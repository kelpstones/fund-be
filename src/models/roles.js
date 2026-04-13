const BaseModel = require("./index");

class Role extends BaseModel {
  constructor() {
    super("roles");
  }

  async createRole(nama, description) {
    try {
      const [id] = await this.knex(this.tableName).insert({
        nama,
        description,
      });
      return id;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id, nama, description) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        nama,
        description,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      await this.knex(this.tableName).where({ id }).del();
    } catch (error) {
      throw error;
    }
  }

  async getAllRoles() {
    try {
      const roles = await this.knex(this.tableName).select("*");
      return roles;
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      const role = await this.knex(this.tableName).where({ id }).first();
      return role;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Role();
