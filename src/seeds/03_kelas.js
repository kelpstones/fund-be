/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  const existing = await knex("kelas").count("id as count").first();
  if (parseInt(existing.count) > 0) return;

  await knex("kelas").insert([
    { nama_kelas: "mikro", deskripsi: "Penjualan tahunan hingga Rp2 miliar" },
    {
      nama_kelas: "kecil",
      deskripsi: "Penjualan tahunan Rp2 miliar - Rp15 miliar",
    },
    {
      nama_kelas: "menengah",
      deskripsi: "Penjualan tahunan Rp15 miliar - Rp50 miliar",
    },
  ]);
};
