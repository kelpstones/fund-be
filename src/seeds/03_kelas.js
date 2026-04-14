/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kelas').del()
  await knex('kelas').insert([
    {id: 1, nama_kelas: 'mikro', deskripsi: 'Deskripsi Kelas 1'},
    {id: 2, nama_kelas: 'kecil', deskripsi: 'Deskripsi Kelas 2'},
    {id: 3, nama_kelas: 'menengah', deskripsi: 'Deskripsi Kelas 3'}
  ]);
};
