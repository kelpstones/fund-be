/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_negosiasis", (table) => {
    table.increments("id").primary();
    table.integer("negosiasis_id").unsigned().notNullable();
    table
      .foreign("negosiasis_id")
      .references("negosiasis.id")
      .onDelete("CASCADE");
    table.integer("pengirim_id").unsigned().notNullable();
    table.foreign("pengirim_id").references("users.id").onDelete("CASCADE");
    table.decimal("penawaran_return", 10, 2).unsigned().notNullable();
    table.decimal("penawaran_nominal", 20, 2).unsigned().notNullable();
    table
      .enum("diajukan_oleh", ["investor", "umkm"])
      .notNullable()
      .defaultTo("investor");
    table
      .enum("status", ["pending", "accepted", "rejected"])
      .defaultTo("pending")
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
  return knex.schema.dropTableIfExists("log_negosiasis");
};
