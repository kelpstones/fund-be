/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("penjualans", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().nullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table.string("periode").notNullable();
    table.integer("total_penjualan").notNullable();
    table.integer("laba_bersih").notNullable();
    table.integer("jumlah_transaksi").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
