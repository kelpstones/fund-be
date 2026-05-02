/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bisnis", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.integer("kelas_id").unsigned().notNullable();
    table.foreign("kelas_id").references("kelas.id").onDelete("CASCADE");
    table.string("nama_bisnis").notNullable();
    table
      .enum("tipe_usaha", [
        "kuliner",
        "fashion",
        "kesehatan_kecantikan",
        "teknologi",
        "pendidikan",
        "pertanian",
        "perdagangan",
        "jasa",
        "kerajinan",
        "lainnya",
      ])
      .notNullable();

    table.string("alamat").notNullable();
    table.string("no_telp").notNullable();
    table.string("email").notNullable().unique();
    table.string("deskripsi").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
