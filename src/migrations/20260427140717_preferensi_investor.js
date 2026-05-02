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
    table.string("tipe_usaha", 255).notNullable();
    table.string("level_usaha", 255).notNullable();
    table.string("range_penghasilan", 255).notNullable();
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
