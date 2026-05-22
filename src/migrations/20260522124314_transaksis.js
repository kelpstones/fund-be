/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("transaksis", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.string("external_id").unique().notNullable().index();
    table
      .enum("tipe", ["deposit", "investasi", "bagi_hasil", "penarikan"])
      .notNullable();
    table.decimal("jumlah", 20, 2).unsigned().notNullable();
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending")
      .notNullable();
    table.text("deskripsi").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
