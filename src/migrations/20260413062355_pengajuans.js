/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("pengajuans", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().notNullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table.decimal("target_pendanaan", 20, 2).unsigned().notNullable();
    table.decimal("total_pendanaan", 20, 2).defaultTo(0);
    table.decimal("per_anual_return", 10, 2).unsigned().notNullable();
    table
      .enum("status", ["draft", "published", "negotiating", "funded"])
      .defaultTo("draft")
      .notNullable();
    table.integer("locked_by_investor_id").unsigned().nullable();
    table
      .foreign("locked_by_investor_id")
      .references("users.id")
      .onDelete("SET NULL");
    table.timestamp("locked_at").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
