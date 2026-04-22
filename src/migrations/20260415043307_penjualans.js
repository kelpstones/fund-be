/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("penjualans", (table) => {
    table.increments("id").primary();
    table.integer("pengajuans_id").unsigned().nullable();
    table.foreign("pengajuans_id").references("pengajuans.id").onDelete("CASCADE");
    table.string("periode").notNullable();
    table.integer("total_penjualan").notNullable();
    table.integer("laba_bersih").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
