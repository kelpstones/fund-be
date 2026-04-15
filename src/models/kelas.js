const BaseModel = require("./base");

class Kelas extends BaseModel {
  constructor() {
    super("kelas");
  }

  async createKelas(nama_kelas, deskripsi) {
    try {
      const [id] = await this.knex(this.tableName)
        .insert({
          nama_kelas,
          deskripsi,
        })
        .returning("id");
      return id;
    } catch (error) {
      throw error;
    }
  }

  async getAllKelas() {
    try {
      const kelasList = await this.knex(this.tableName).select("*");
      return kelasList;
    } catch (error) {
      throw error;
    }
  }

  async getKelasById(id) {
    try {
      const kelas = await this.knex(this.tableName).where({ id }).first();
      return kelas;
    } catch (error) {
      throw error;
    }
  }

  async updateKelas(id, nama_kelas, deskripsi) {
    try {
      const data = await this.knex(this.tableName).where({ id }).update({
        nama_kelas,
        deskripsi,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteKelas(id) {
    try {
      const data = await this.knex(this.tableName).where({ id }).del();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Kelas();
