/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  const existing = await knex("kelas").count("id as count").first();
  if (parseInt(existing.count) > 0) return;

  await knex("kelas").insert([
    { nama_kelas: "mikro", deskripsi: "Deskripsi Kelas 1" },
    { nama_kelas: "kecil", deskripsi: "Deskripsi Kelas 2" },
    { nama_kelas: "menengah", deskripsi: "Deskripsi Kelas 3" },
  ]);
};
