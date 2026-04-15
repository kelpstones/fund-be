/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("negosiasis", (table) => {
    table.increments("id").primary();
    table.integer("pengajuans_id").unsigned().notNullable();
    table
      .foreign("pengajuans_id")
      .references("pengajuans.id")
      .onDelete("CASCADE");
    table.integer("investor_id").unsigned().notNullable();
    table.foreign("investor_id").references("users.id").onDelete("CASCADE");
    table
      .enum("status", ["active", "deal", "rejected", "canceled"])
      .notNullable();
    table.bigint("id_terakhir_oleh").unsigned().notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
