/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("admins", (table) => {
    table.increments("id").primary();
    table.string("nama").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("no_telp").nullable();
    table.enum("level", ["superadmin", "admin"]).defaultTo("admin");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
