/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("dokumen_bisnis", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().notNullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table
      .enum("jenis_dokumen", [
        "legalitas_usaha",
        "proposal_pendanaan",
        "laporan_penjualan",
      ])
      .notNullable();
    table.string("file_url").nullable();
    table
      .enum("status", ["belum_upload", "pending", "valid", "invalid"])
      .defaultTo("belum_upload")
      .notNullable();
    table.text("catatan").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("dokumen_bisnis");
};
