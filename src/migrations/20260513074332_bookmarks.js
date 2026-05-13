/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bookmarks", (table) => {
    table.increments("id").primary();
    table.integer("investor_id").unsigned().notNullable();
    table.integer("bisnis_id").unsigned().notNullable();
    table.timestamps(true, true);

    table
      .foreign("investor_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("bisnis_id")
      .references("id")
      .inTable("bisnis")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("bookmarks");
};
