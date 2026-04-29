/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("personalisasi", function (table) {
    table.increments("id").primary();
    table.integer("investor_id").unsigned().notNullable();
    table
      .foreign("investor_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("bisnis_id").unsigned().notNullable();
    table
      .foreign("bisnis_id")
      .references("id")
      .inTable("bisnis")
      .onDelete("CASCADE");

    table.float("skor_kecocokan").notNullable();
    table.string("matched_class").nullable(); // class bisnis saat matching
    table.timestamp("matched_at").defaultTo(knex.fn.now());

    table.unique(["investor_id", "bisnis_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("personalisasi");
};
