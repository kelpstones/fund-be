/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .table("pengajuans", (table) => {
      table.index(["bisnis_id"], "idx_pengajuans_bisnis_id");

      table.index(["status"], "idx_pengajuans_status");

      table.index(["bisnis_id", "status"], "idx_pengajuans_bisnis_status");
    })
    .table("negosiasis", (table) => {
      table.index(["investor_id"], "idx_negosiasis_investor_id");
      table.index(["pengajuans_id"], "idx_negosiasis_pengajuan_id");

      table.index(["status"], "idx_negosiasis_status");
      table.index(["investor_id", "status"], "idx_negosiasis_investor_status");
    })
    .table("log_negosiasis", (table) => {
      table.index(["negosiasis_id"], "idx_log_negosiasis_negosiasis_id");
    })
    .table("investasis", (table) => {
      table.index(["investor_id"], "idx_investasis_investor_id");
      table.index(["pengajuans_id"], "idx_investasis_pengajuan_id");
    })
    .table("notifications", (table) => {
      table.index(["user_id"], "idx_notifications_user_id");
      table.index(["user_id", "is_read"], "idx_notifications_user_id_is_read");
    })
    .table("invoices", (table) => {
      table.index(["investor_id"], "idx_invoices_investor_id");
      table.index(["negosiasis_id"], "idx_invoices_negosiasis_id");
      table.index(["status"], "idx_invoices_status");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .table("pengajuans", (table) => {
      table.dropIndex([], "idx_pengajuans_bisnis_id");
      table.dropIndex([], "idx_pengajuans_status");
      table.dropIndex([], "idx_pengajuans_bisnis_status");
    })
    .table("negosiasis", (table) => {
      table.dropIndex([], "idx_negosiasis_pengajuans_id");
      table.dropIndex([], "idx_negosiasis_investor_id");
      table.dropIndex([], "idx_negosiasis_status");
      table.dropIndex([], "idx_negosiasis_pengajuan_status");
    })
    .table("log_negosiasis", (table) => {
      table.dropIndex([], "idx_log_negosiasis_negosiasi_created");
    })
    .table("investasis", (table) => {
      table.dropIndex([], "idx_investasis_investor_id");
      table.dropIndex([], "idx_investasis_pengajuans_id");
    })
    .table("notifications", (table) => {
      table.dropIndex([], "idx_notifications_user_id");
      table.dropIndex([], "idx_notifications_user_is_read");
    })
    .table("invoices", (table) => {
      table.dropIndex([], "idx_invoices_negosiasi_id");
      table.dropIndex([], "idx_invoices_investor_id");
      table.dropIndex([], "idx_invoices_status");
    });
};
