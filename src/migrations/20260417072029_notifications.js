/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().nullable();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.integer("admin_id").unsigned().nullable();
    table.foreign("admin_id").references("admins.id").onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("message").notNullable();
    table.enum("type", ["pengajuan", "pengajuan_status", "negosiasi", "distribusi_profit"]).notNullable();
    table.integer("reference_id").nullable();
    table.boolean("is_read").defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
