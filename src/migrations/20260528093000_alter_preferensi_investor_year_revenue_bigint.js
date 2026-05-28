/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("preferensi_investor", (table) => {
    table.bigInteger("year_revenue").notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("preferensi_investor", (table) => {
    table.integer("year_revenue").notNullable().alter();
  });
};

