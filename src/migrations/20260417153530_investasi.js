/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("investasis", (table) => {
    table.increments("id").primary();
    table.integer("investor_id").unsigned().notNullable();
    table.foreign("investor_id").references("users.id").onDelete("CASCADE");

    table.integer("pengajuans_id").unsigned().notNullable();
    table
      .foreign("pengajuans_id")
      .references("pengajuans.id")
      .onDelete("CASCADE");

    table.integer("negosiasis_id").unsigned().notNullable();
    table
      .foreign("negosiasis_id")
      .references("negosiasis.id")
      .onDelete("SET NULL");

    table.bigint("nominal_investasi", 20, 2).unsigned().notNullable();
    table.decimal("return_investasi", 20, 2).unsigned().notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
