const BaseModel = require("./base");

const JENIS_DOKUMEN = [
  "legalitas_usaha",
  "proposal_pendanaan",
  "laporan_penjualan",
];

class DokumenBisnis extends BaseModel {
  constructor() {
    super("dokumen_bisnis");
  }

  #formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      bisnis_id: row.bisnis_id,
      jenis_dokumen: row.jenis_dokumen,
      file_url: row.file_url,
      status: row.status,
      catatan: row.catatan,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async getByBisnisId(bisnis_id) {
    try {
      const rows = await this.knex(this.tableName).where({ bisnis_id });
      return rows.map((row) => this.#formatResponse(row));
    } catch (error) {
      throw error;
    }
  }

  async getByBisnisIdAndJenis(bisnis_id, jenis_dokumen) {
    try {
      const row = await this.knex(this.tableName)
        .where({ bisnis_id, jenis_dokumen })
        .first();
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async getKelengkapan(bisnis_id) {
    try {
      const uploaded = await this.knex(this.tableName)
        .where({ bisnis_id })
        .pluck("jenis_dokumen");
      const belumUpload = JENIS_DOKUMEN.filter((j) => !uploaded.includes(j));
      return {
        total: JENIS_DOKUMEN.length,
        sudah_upload: uploaded.length,
        belum_upload: belumUpload,
        persen: Math.round((uploaded.length / JENIS_DOKUMEN.length) * 100),
      };
    } catch (error) {
      throw error;
    }
  }

  async insert(bisnis_id, jenis_dokumen, file_url) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({ bisnis_id, jenis_dokumen, file_url, status: "pending" })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [row] = await this.knex(this.tableName)
        .where({ id })
        .update({ ...data, updated_at: this.knex.fn.now() })
        .returning("*");
      return this.#formatResponse(row);
    } catch (error) {
      throw error;
    }
  }

  // ADMIN: list semua dokumen pending + nama bisnis
  async getPending() {
    try {
      const rows = await this.knex(this.tableName)
        .join("bisnis", "dokumen_bisnis.bisnis_id", "bisnis.id")
        .where("dokumen_bisnis.status", "pending")
        .select(
          "dokumen_bisnis.id",
          "dokumen_bisnis.bisnis_id",
          "bisnis.nama_bisnis",
          "dokumen_bisnis.jenis_dokumen",
          "dokumen_bisnis.file_url",
          "dokumen_bisnis.status",
          "dokumen_bisnis.updated_at",
        )
        .orderBy("dokumen_bisnis.updated_at", "asc");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cek apakah semua dokumen wajib sudah valid
  async isAllValid(bisnis_id) {
    try {
      const validDocs = await this.knex(this.tableName)
        .where({ bisnis_id, status: "valid" })
        .pluck("jenis_dokumen");
      const belumValid = JENIS_DOKUMEN.filter((j) => !validDocs.includes(j));
      return { isValid: belumValid.length === 0, belumValid };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DokumenBisnis();
