/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("supported_banks", (table) => {
      table.increments("id").primary();
      table.string("code", 50).unique().notNullable();
      table.string("name", 100).notNullable();
      table.enum("type", ["bank", "ewallet"]).notNullable().defaultTo("bank");
      table.boolean("is_active").defaultTo(true).notNullable();
      table.string("logo_url").nullable();
      table.timestamps(true, true);
    })
    .table("user_bank_accounts", (table) => {
      table
        .integer("bank_id")
        .unsigned()
        .references("id")
        .inTable("supported_banks")
        .onDelete("RESTRICT");
      table.dropColumn("bank_name");
    });
};

exports.down = function(knex) {
  return knex.schema
    .table("user_bank_accounts", (table) => {
      table.string("bank_name").nullable();
      table.dropColumn("bank_id");
    })
    .dropTableIfExists("supported_banks");
};
