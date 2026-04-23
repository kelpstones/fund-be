const Penjualans = require("../models/penjualans");
const { ResponseHelper } = require("../utils/index");
const { penjualanValidation } = require("../validation/penjualans");
class PenjualansController {
  async createPenjualan(req, res) {
    const trx = await knex.transaction();
    try {
      const {
        pengajuans_id,
        periode,
        total_penjualan,
        laba_bersih,
        jumlah_transaksi,
      } = req.body;
      const { error } = penjualanValidation({
        pengajuans_id,
        periode,
        total_penjualan,
        laba_bersih,
        jumlah_transaksi,
      });

      if (error) {
        return ResponseHelper.badRequest(res, error.details[0].message);
      }

      const result = await Penjualans.createPenjualan(
        {
          pengajuans_id,
          periode,
          total_penjualan,
          laba_bersih,
          jumlah_transaksi,
        },
        trx,
      );
      await trx.commit();
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

  async getByBisnis(req, res) {
    try {
      const { bisnis_id } = req.params;
      const data = await Penjualans.getPenjualanByBisnisId(bisnis_id);
      return ResponseHelper.success(
        res,
        "Berhasil mengambil riwayat penjualan",
        data,
      );
    } catch (error) {
      return ResponseHelper.serverError(res, "Gagal mengambil data penjualan");
    }
  }
}
