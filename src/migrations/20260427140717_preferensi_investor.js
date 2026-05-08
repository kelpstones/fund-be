/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("preferensi_investor", function (table) {
    table.increments("id").primary();
    table.integer("investor_id").unsigned().notNullable();
    table
      .foreign("investor_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.decimal("kepuasan_pelanggan", 10, 2).notNullable();
    table.decimal("digital_adoption_score", 10, 2).notNullable();
    table.decimal("net_profit_margin", 10, 2).notNullable();
    table.integer("year_revenue", 10).notNullable();
    table.decimal("business_tenure_years", 10, 2).notNullable();

    table.unique(["investor_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("preferensi_investor");
};
