const { hashPassword } = require("../utils/Bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const hashedPassword = await hashPassword("password123");

  // Deletes ALL existing entries
  await knex("admins").del();
  await knex("admins").insert([
    {
      id: 1,
      nama: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      no_telp: "1234567890",
      level: "superadmin",
    },
    {
      id: 2,
      nama: "Jane Smith",
      email: "jane@example.com",
      password: hashedPassword,
      no_telp: "0987654321",
      level: "admin",
    },
  ]);
};
