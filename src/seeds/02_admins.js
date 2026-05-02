const { hashPassword } = require("../utils/Bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const existing = await knex("admins").count("id as count").first();
  if (parseInt(existing.count) > 0) return;

  const hashedPassword = await hashPassword("password123");

  await knex("admins").insert([
    {
      nama: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      no_telp: "1234567890",
      level: "superadmin",
    },
    {
      nama: "Jane Smith",
      email: "jane@example.com",
      password: hashedPassword,
      no_telp: "0987654321",
      level: "admin",
    },
  ]);
};
