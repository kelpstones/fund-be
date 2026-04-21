/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_negosiasis", (table) => {
    table.increments("id").primary();
    table.integer("negosiasi_id").unsigned().notNullable();
    table
      .foreign("negosiasi_id")
      .references("negosiasis.id")
      .onDelete("CASCADE");
    table.integer("pengirim_id").unsigned().notNullable();
    table.foreign("pengirim_id").references("users.id").onDelete("CASCADE");
    table.integer("penawaran_return").notNullable();
    table.integer("penawaran_nominal").notNullable();
    table.text("catatan").nullable();
    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
