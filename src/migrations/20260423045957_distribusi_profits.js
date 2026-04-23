/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("distribusi_profits", (table) => {
    table.increments("id").primary();

    table.integer("penjualans_id").unsigned().notNullable();
    table
      .foreign("penjualans_id")
      .references("penjualans.id")
      .onDelete("CASCADE");

    table.integer("investasi_id").unsigned().notNullable();
    table
      .foreign("investasi_id")
      .references("investasis.id")
      .onDelete("CASCADE");

    table.integer("investor_id").unsigned().notNullable();
    table.foreign("investor_id").references("users.id").onDelete("CASCADE");

    table.bigInteger("nominal_profit").unsigned().notNullable().defaultTo(0);
    table.string("periode").notNullable();
    table
      .enu("status", ["pending", "distributed"])
      .notNullable()
      .defaultTo("pending");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("distribusi_profits");
};
