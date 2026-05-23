/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("user_bank_accounts", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
        .index();
      table.string("bank_name").notNullable();
      table.string("bank_account_number").notNullable();
      table.string("bank_account_holder").notNullable();
      table.boolean("is_primary").defaultTo(false).notNullable();
      table.timestamps(true, true);
    })
    .table("transaksis", (table) => {
      table.string("bank_name").nullable();
      table.string("bank_account_number").nullable();
      table.string("bank_account_holder").nullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("user_bank_accounts")
    .table("transaksis", (table) => {
      table.dropColumn("bank_name");
      table.dropColumn("bank_account_number");
      table.dropColumn("bank_account_holder");
    });
};
