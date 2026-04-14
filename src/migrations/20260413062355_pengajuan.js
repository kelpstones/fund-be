/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("pengajuan", (table) => {
    table.increments("id").primary();
    table.integer("bisnis_id").unsigned().notNullable();
    table.foreign("bisnis_id").references("bisnis.id").onDelete("CASCADE");
    table.enum("status", ["pending", "approved", "rejected"]).defaultTo("pending");
    table.string("alasan_reject").nullable();
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
