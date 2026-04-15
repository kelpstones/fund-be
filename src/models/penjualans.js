const BaseModel = require("./base");

class Penjualans extends BaseModel {
  constructor() {
    super("penjualans");
  }

  async createPenjualan(
    bisnis_id,
    periode,
    total_penjualan,
    laba_bersih,
    jumlah_transaksi,
  ) {
    try {
      const penjualan = await this.knex(this.tableName)
        .insert({
          bisnis_id,
          periode,
          total_penjualan,
          laba_bersih,
          jumlah_transaksi,
        })
        .returning([
          "id",
          "bisnis_id",
          "periode",
          "total_penjualan",
          "laba_bersih",
          "jumlah_transaksi",
        ]);
      return penjualan;
    } catch (error) {
      throw error;
    }
  }

  async getPenjualanByBisnisId(bisnis_id) {
    try {
      const penjualan = await this.knex(this.tableName)
        .where("bisnis_id", bisnis_id)
        .select([
          "id",
          "bisnis_id",
          "periode",
          "total_penjualan",
          "laba_bersih",
          "jumlah_transaksi",
        ]);
      return penjualan;
    } catch (error) {
      throw error;
    }
  }

  async updatePenjualan(id, total_penjualan, laba_bersih, jumlah_transaksi) {
    try {
      const penjualan = await this.knex(this.tableName)
        .where("id", id)
        .update({
          total_penjualan,
          laba_bersih,
          jumlah_transaksi,
        })
        .returning([
          "id",
          "bisnis_id",
          "periode",
          "total_penjualan",
          "laba_bersih",
          "jumlah_transaksi",
        ]);
      return penjualan;
    } catch (error) {
      throw error;
    }
  }

  async deletePenjualan(id) {
    try {
      const penjualan = await this.knex(this.tableName).where("id", id).del();
      return penjualan;
    } catch (error) {
      throw error;
    }
  }

  async getAllPenjualan(page = 1, limit = 10) {
    try {
      const penjualan = await this.knex(this.tableName)
        .select([
          "id",
          "bisnis_id",
          "periode",
          "total_penjualan",
          "laba_bersih",
          "jumlah_transaksi",
        ])
        .offset((page - 1) * limit)
        .limit(limit);

      return penjualan;
    } catch (error) {
      throw error;
    }
  }

  async getPenjualanById(id) {
    try {
      const penjualan = await this.knex(this.tableName).where("id", id).first();
      return penjualan;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Penjualans();
