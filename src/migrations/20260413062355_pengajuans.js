/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("pengajuans", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().notNullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table.bigint("target_pendanaan").notNullable();
    table.bigint("total_pendanaan").defaultTo(0);
    table.bigint("per_anual_return").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
