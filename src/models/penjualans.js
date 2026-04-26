const BaseModel = require("./base");

class Penjualans extends BaseModel {
  constructor() {
    super("penjualans");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      periode: row.periode,
      total_penjualan: row.total_penjualan,
      laba_bersih: row.laba_bersih,
      laba_kotor: row.laba_kotor,
      jumlah_transaksi: row.jumlah_transaksi,
      created_at: row.created_at,
      // Data Relasi
      pengajuan: {
        id: row.pengajuans_id,
        bisnis_id: row.bisnis_id,
        nama_bisnis: row.nama_bisnis,
      },
    };
  }

  async createPenjualan(data, trx = this.knex) {
    try {
      const [row] = await trx(this.tableName)
        .insert({
          pengajuans_id: data.pengajuans_id,
          periode: data.periode,
          total_penjualan: data.total_penjualan,
          laba_bersih: data.laba_bersih,
          laba_kotor: data.laba_kotor,
          jumlah_transaksi: data.jumlah_transaksi,
        })
        .returning("id");

      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getPenjualanByPengajuanId(pengajuans_id) {
    try {
      const results = await this.knex(this.tableName)
        .select("penjualans.*", "bisnis.nama_bisnis", "pengajuans.bisnis_id")
        .join("pengajuans", "penjualans.pengajuans_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .where("penjualans.pengajuans_id", pengajuans_id);

      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getPenjualanById(id, trx = this.knex) {
    try {
      const row = await trx(this.tableName)
        .select("penjualans.*", "bisnis.nama_bisnis", "pengajuans.bisnis_id")
        .join("pengajuans", "penjualans.pengajuans_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .where("penjualans.id", id)
        .first();

      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async updatePenjualan(id, data) {
    try {
      await this.knex(this.tableName).where("id", id).update({
        total_penjualan: data.total_penjualan,
        laba_bersih: data.laba_bersih,
        jumlah_transaksi: data.jumlah_transaksi,
        periode: data.periode,
        updated_at: this.knex.fn.now(),
      });

      return await this.getPenjualanById(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllPenjualan(page = 1, limit = 10) {
    try {
      const results = await this.knex(this.tableName)
        .select("penjualans.*", "bisnis.nama_bisnis", "pengajuans.bisnis_id")
        .join("pengajuans", "penjualans.pengajuans_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy("penjualans.created_at", "desc");

      return results.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Penjualans();
