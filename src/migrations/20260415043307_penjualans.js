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
    table.bigInteger("total_penjualan").notNullable().defaultTo(0);
    table.integer("jumlah_transaksi").notNullable().defaultTo(0);
    table.bigInteger("laba_bersih").notNullable().defaultTo(0);
    table.bigInteger("laba_kotor").notNullable().defaultTo(0);
    // table.timestamps("tanggal_distribusi").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("penjualans");
};
