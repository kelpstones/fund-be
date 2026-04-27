/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("approvals", (table) => {
    table.increments("id").primary();
    table.integer("pengajuans_id").unsigned().notNullable();
    table
      .foreign("pengajuans_id")
      .references("pengajuans.id")
      .onDelete("CASCADE");
    table.integer("approver_id").unsigned().nullable();
    table.foreign("approver_id").references("admins.id").onDelete("CASCADE");
    table
      .enum("status", ["approved", "rejected", "pending"])
      .defaultTo("pending")
      .notNullable();
    table.text("catatan").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("approvals");
};
