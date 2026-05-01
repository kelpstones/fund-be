/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("verify_email", (table) => {
        table.increments("id").primary();
        table.integer("id_user").unsigned().notNullable();
        table.string("token").notNullable().unique();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("expires_at").notNullable();

        table.foreign("id_user").references("id").inTable("users").onDelete("CASCADE");
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("verify_email");
};
