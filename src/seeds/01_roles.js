/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const existing = await knex("roles").count("id as count").first();
  if (parseInt(existing.count) > 0) return;

  await knex("roles").insert([
    { nama: "umkm" },
    { nama: "investor" }
  ]);
};