/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE pengajuans DROP CONSTRAINT IF EXISTS pengajuans_status_check;
    ALTER TABLE pengajuans ADD CONSTRAINT pengajuans_status_check CHECK (status IN ('draft', 'published', 'negotiating', 'waiting_payment', 'funded', 'rejected'));
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE pengajuans DROP CONSTRAINT IF EXISTS pengajuans_status_check;
    ALTER TABLE pengajuans ADD CONSTRAINT pengajuans_status_check CHECK (status IN ('draft', 'published', 'negotiating', 'funded', 'rejected'));
  `);
};
