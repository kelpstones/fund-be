const distribusi_profits = require("../models/distribusi_profits");
const Penjualans = require("../models/penjualans");
const { ResponseHelper } = require("../utils/index");
const { PenjualanValidator } = require("../validation/index");
class PenjualansController {
  async createPenjualan(req, res) {
    const trx = await knex.transaction();
    try {
      const {
        pengajuans_id,
        periode,
        total_penjualan,
        laba_bersih,
        laba_kotor,
        jumlah_transaksi,
      } = req.body;
      const { error } = PenjualanValidator.penjualanValidation({
        pengajuans_id,
        periode,
        total_penjualan,
        laba_bersih,
        laba_kotor,
        jumlah_transaksi,
      });

      if (error) {
        await trx.rollback();
        return ResponseHelper.badRequest(res, error.details[0].message);
      }

      const pengajuan = await pengajuans.getPengajuanById(pengajuans_id);

      if (!pengajuan) {
        await trx.rollback();
        return ResponseHelper.error(res, "Pengajuan not found", 404);
      }

      const result = await Penjualans.createPenjualan(
        {
          pengajuans_id,
          periode,
          total_penjualan,
          laba_bersih,
          laba_kotor,
          jumlah_transaksi,
        },
        trx,
      );

      const investasiList =
        await investasi.getInvestasiByPengajuanId(pengajuans_id);

      const distributionPromises = investasiList.map((investasi) => ({
        penjualans_id: penjualan.id,
        investasi_id: inv.id,
        investor_id: inv.investor.id,
        nominal_profit: (data.laba_bersih * inv.return_investasi) / 100,
        periode: data.periode,
        status: "pending",
      }));

      let distribusiList = [];
      if (distribusiData.length > 0) {
        distribusiList = await distribusi_profits.bulkCreate(
          distributionPromises,
          trx,
        );
      }

      await trx.commit();

      for (const inv of investasiList) {
        await notificationHelper.notify({
          user_id: inv.investor.id,
          title: "Distribusi Profit Tersedia",
          message: `Laporan penjualan periode ${data.periode} telah diinput. Profit kamu segera didistribusikan.`,
          type: "distribusi_profit",
          reference_id: penjualan.id,
        });
      }

      return ResponseHelper.created(res, result);
    } catch (error) {
      await trx.rollback();
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while creating penjualan data",
      );
    }
  }

  async getAllPenjualan(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await Penjualans.getAllPenjualan(page, limit);
      return ResponseHelper.withPagination(
        res,
        "Penjualan data fetched successfully",
        data,
        { page, limit, totalItems: data.length },
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching penjualan data",
      );
    }
  }

  async getPenjualanByPengajuanId(req, res) {
    try {
      const { pengajuans_id } = req.params;
      const data = await Penjualans.getPenjualanByPengajuanId(pengajuans_id);
      if (!data || data.length === 0) {
        return ResponseHelper.error(
          res,
          "No penjualan found for this pengajuan",
          404,
        );
      }
      return ResponseHelper.success(
        res,
        "Penjualan data fetched successfully",
        data,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching penjualan data",
      );
    }
  }

  async getPenjualanById(req, res) {
    try {
      const { id } = req.params;
      const data = await Penjualans.getPenjualanById(id);
      if (!data) {
        return ResponseHelper.error(res, "Penjualan not found", 404);
      }
      return ResponseHelper.success(
        res,
        "Penjualan data fetched successfully",
        data,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching penjualan data",
      );
    }
  }

  async updatePenjualan(req, res) {
    try {
      const { id } = req.params;

      const existing = await Penjualans.getPenjualanById(id);
      if (!existing) {
        return ResponseHelper.error(res, "Penjualan not found", 404);
      }

      const validate = PenjualanValidator.penjualanUpdateValidation(req.body);
      if (validate.error) {
        return ResponseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }

      const updated = await Penjualans.updatePenjualan(id, req.body);
      return ResponseHelper.success(
        res,
        "Penjualan updated successfully",
        updated,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while updating penjualan data",
      );
    }
  }
}

module.exports = PenjualansController;
