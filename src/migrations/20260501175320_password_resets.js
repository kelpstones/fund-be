/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("password_resets", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("token").notNullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expires_at").notNullable();

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("password_resets");
};
