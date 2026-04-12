const BaseModel = require("./index");

class Role extends BaseModel {
  constructor() {
    super("roles");
  }

  async createRole(name, description) {
    try {
      const [id] = await this.knex(this.tableName).insert({
        name,
        description,
      });
      return id;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id, name, description) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        name,
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
