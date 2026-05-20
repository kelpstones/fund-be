/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("refresh_tokens", (table) => {
    table.string("token").primary();
    table.integer("owner_id").notNullable().index();
    table.enum("owner_type", ["users", "admins"]).notNullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("is_revoked").defaultTo(false);
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("refresh_tokens");
};
