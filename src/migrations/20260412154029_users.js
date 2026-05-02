/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("nama").notNullable();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.string("nik").notNullable().unique();
        table.string("no_telp").notNullable().unique();
        table.integer("role_id").unsigned().references("id").inTable("roles").onDelete("SET NULL");
        table.integer("is_onboarded").defaultTo(0);
        table.boolean("email_verified").defaultTo(false).notNullable();
        table.timestamps(true, true);
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("users");
};
