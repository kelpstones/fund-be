const BaseModel = require("./base");

class Invoices extends BaseModel {
  constructor() {
    super("invoices");
  }

  async createInvoice(
    id_negosiasi,
    pengajuan_id,
    investor_id,
    nominal_tagihan,
    kode_pembayaran,
    tenggat_waktu,
  ) {
    try {
      const [invoice] = await this.knex(this.tableName)
        .insert({
          negosiasi_id: id_negosiasi,
          pengajuan_id: pengajuan_id,
          investor_id: investor_id,
          nominal_tagihan: nominal_tagihan,
          kode_pembayaran: kode_pembayaran,
          tenggat_waktu: tenggat_waktu,
          status: "pending",
        })
        .returning("*");
      return invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  async getAllInvoices(page = 1, limit = 10, startDate, endDate, status) {
    try {
      let query = this.knex(this.tableName)
        .select(
          "invoices.*",
          "bisnis.nama_bisnis",
          "investor.nama as nama_investor",
          "pemilik.nama as nama_pemilik",
          "pengajuans.target_pendanaan as target_dana",
          "pengajuans.per_anual_return as per_annual",
          "pengajuans.id as pengajuan_id",
          "invoices.updated_at as payment_updated_at",
          "negosiasis.id as negosiasi_id",

        )
        .join("pengajuans", "invoices.pengajuan_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users as investor", "invoices.investor_id", "investor.id")
        .leftJoin("users as pemilik", "bisnis.user_id", "pemilik.id")
        .leftJoin("negosiasis", "invoices.negosiasi_id", "negosiasis.id") // Tambahan: Wajib di-join agar bisa ambil status
        .orderBy("created_at", "desc")
        .offset((page - 1) * limit)
        .limit(limit);

      if (startDate && endDate) {
        query = query.whereBetween("created_at", [startDate, endDate]);
      }

      if (status) {
        query = query.where("status", status);
      }
      const invoices = await query
        .orderBy("invoices.created_at", "desc")
        .offset((page - 1) * limit)
        .limit(limit);

      return invoices.map((invoice) => ({
        id: invoice.id,
        kode_pembayaran: invoice.kode_pembayaran,
        nominal_tagihan: invoice.nominal_tagihan,
        status: invoice.status,
        tenggat_waktu: invoice.tenggat_waktu,
        created_at: invoice.created_at,
        payment_updated_at: invoice.payment_updated_at,
        detail_pengajuan: {
          id: invoice.pengajuan_id,
          id_negosiasi: invoice.negosiasi_id,
          nama_bisnis: invoice.nama_bisnis,
          nama_pemilik: invoice.nama_pemilik,
          per_annual: invoice.per_annual,
          target_dana: invoice.target_dana,
        },

        investor: {
          id: invoice.investor_id,
          nama: invoice.nama_investor,
        },
      }));
    } catch (error) {
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const invoice = await this.knex(this.tableName)
        .select(
          "invoices.*",
          "pengajuans.target_pendanaan as target_dana",
          "pengajuans.per_anual_return as per_annual",
          "bisnis.nama_bisnis as nama_bisnis",
          "investor.nama as nama_investor",
          "pemilik.nama as nama_pemilik",
          "pengajuans.id as pengajuan_id",
          "invoices.updated_at as payment_updated_at",
          "negosiasis.id as negosiasi_id",
        )
        .leftJoin("pengajuans", "invoices.pengajuan_id", "pengajuans.id")
        .leftJoin("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users as investor", "invoices.investor_id", "investor.id")
        .leftJoin("users as pemilik", "bisnis.user_id", "pemilik.id")
        .leftJoin("negosiasis", "invoices.negosiasi_id", "negosiasis.id")
        .where("invoices.id", id)
        .first();

      if (!invoice) {
        return null;
      }
      return {
        id: invoice.id,
        kode_pembayaran: invoice.kode_pembayaran,
        nominal_tagihan: invoice.nominal_tagihan,
        status: invoice.status,
        tenggat_waktu: invoice.tenggat_waktu,
        created_at: invoice.created_at,
        payment_updated_at: invoice.payment_updated_at,
        detail_pengajuan: {
          id: invoice.pengajuan_id,
          id_negosiasi: invoice.negosiasi_id,
          target_dana: invoice.target_dana,
          per_annual: invoice.per_annual,
          nama_bisnis: invoice.nama_bisnis,
          nama_pemilik: invoice.nama_pemilik,
        },

        investor: {
          id: invoice.investor_id,
          nama: invoice.nama_investor,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getInvoicesByInvestor(
    investor_id,
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
  ) {
    try {
      let query = this.knex(this.tableName)
        .select(
          "invoices.*",
          "bisnis.nama_bisnis",
          "investor.nama as nama_investor",
          "pemilik.nama as nama_pemilik",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan as target_dana",
          "pengajuans.per_anual_return as per_annual",
          "invoices.updated_at as payment_updated_at",
          "negosiasis.id as negosiasi_id",
        )
        .join("pengajuans", "invoices.pengajuan_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("negosiasis", "invoices.negosiasi_id", "negosiasis.id")
        .leftJoin("users as pemilik", "bisnis.user_id", "pemilik.id")
        .leftJoin("users as investor", "invoices.investor_id", "investor.id")
        .where("invoices.investor_id", investor_id);

      if (startDate && endDate) {
        query = query.whereBetween("invoices.created_at", [startDate, endDate]);
      }

      if (status) {
        query = query.where("invoices.status", status);
      }

      const invoices = await query
        .orderBy("invoices.created_at", "desc")
        .offset((page - 1) * limit)
        .limit(limit);

      return invoices.map((invoice) => ({
        id: invoice.id,
        kode_pembayaran: invoice.kode_pembayaran,
        nominal_tagihan: invoice.nominal_tagihan,
        status: invoice.status,
        tenggat_waktu: invoice.tenggat_waktu,
        created_at: invoice.created_at,
        payment_updated_at: invoice.payment_updated_at,
        detail_pengajuan: {
          id: invoice.pengajuan_id,
          id_negosiasi: invoice.negosiasi_id,
          target_dana: invoice.target_dana,
          per_annual: invoice.per_annual,
          nama_bisnis: invoice.nama_bisnis,
          nama_pemilik: invoice.nama_pemilik,
        },

        investor: {
          id: invoice.investor_id,
          nama: invoice.nama_investor,
        },
      }));
    } catch (error) {
      console.error("Error fetching investor invoices:", error);
      throw error;
    }
  }
  async updateStatus(id, status, trx = this.knex) {
    try {
      await trx(this.tableName).where({ id }).update({
        status,
        updated_at: trx.fn.now(),
      });
      const invoice = await this.knex(this.tableName)
        .select(
          "invoices.*",
          "bisnis.nama_bisnis",
          "investor.nama as nama_investor",
          "pemilik.nama as nama_pemilik",
          "pengajuans.id as pengajuan_id",
          "pengajuans.target_pendanaan as target_dana",
          "pengajuans.per_anual_return as per_annual",
          "invoices.updated_at as payment_updated_at",
        )
        .join("pengajuans", "invoices.pengajuan_id", "pengajuans.id")
        .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
        .leftJoin("users as pemilik", "bisnis.user_id", "pemilik.id")
        .leftJoin("users as investor", "invoices.investor_id", "investor.id")
        .where("invoices.id", id)
        .first();

      if (!invoice) return null;

      return {
        id: invoice.id,
        kode_pembayaran: invoice.kode_pembayaran,
        nominal_tagihan: invoice.nominal_tagihan,
        status: status,
        tenggat_waktu: invoice.tenggat_waktu,
        created_at: invoice.created_at,
        payment_updated_at: invoice.payment_updated_at,

        detail_pengajuan: {
          id: invoice.pengajuan_id,
          negosiasi_id: invoice.negosiasi_id,
          target_dana: invoice.target_dana,
          per_annual: invoice.per_annual,
          nama_bisnis: invoice.nama_bisnis,
          nama_pemilik: invoice.nama_pemilik,
        },

        investor: {
          id: invoice.investor_id,
          nama: invoice.nama_investor,
        },
      };
      return updated;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Invoices();
