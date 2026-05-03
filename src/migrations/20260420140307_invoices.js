/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("invoices", (table) => {
    table.increments("id").primary();
    table.integer("negosiasi_id").unsigned().notNullable();
    table
      .foreign("negosiasi_id")
      .references("negosiasis.id")
      .onDelete("CASCADE");
    table.integer("pengajuan_id").unsigned().notNullable();
    table
      .foreign("pengajuan_id")
      .references("pengajuans.id")
      .onDelete("CASCADE");
    table.integer("investor_id").unsigned().notNullable();
    table.foreign("investor_id").references("users.id").onDelete("CASCADE");
    table.decimal("nominal_tagihan", 20, 2).unsigned().notNullable();
    table.decimal("ppn", 5, 2).unsigned().defaultTo(11.00).notNullable();
    table.string("kode_pembayaran", 100).notNullable();
    table.timestamp("tenggat_waktu").notNullable();
    table
      .enum("status", ["pending", "paid", "cancelled"])
      .defaultTo("pending")
      .notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("invoices");
};
