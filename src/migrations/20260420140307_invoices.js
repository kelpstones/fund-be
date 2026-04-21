/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("invoices", (table) => {
    table.increments("id").primary();
    table.integer("id_negosiasi").unsigned().notNullable();
    table
      .foreign("id_negosiasi")
      .references("negosiasis.id")
      .onDelete("CASCADE");
    table.integer("id_pengajuan").unsigned().notNullable();
    table
      .foreign("id_pengajuan")
      .references("pengajuans.id")
      .onDelete("CASCADE");
    table.integer("id_investor").unsigned().notNullable();
    table.foreign("id_investor").references("users.id").onDelete("CASCADE");
    table.bigint("nominal_tagihan", 20, 2).unsigned().notNullable();
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
