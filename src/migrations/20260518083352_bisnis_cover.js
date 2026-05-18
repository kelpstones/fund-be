/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bisnis_cover", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().notNullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table.string("image_url").nullable();
    table.integer("urutan").unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
