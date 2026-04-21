const Investasi = require("../models/investasi");
const { ResponseHelper } = require("../utils/index");

class InvestasiController {
  async getInvestasiByPengajuanId(req, res) {
    try {
      const { pengajuans_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const investasiList = await Investasi.getInvestasiByPengajuanId(
        pengajuans_id,
        page,
        limit,
      );
      return ResponseHelper.withPagination(
        res,
        "Investasi data fetched successfully",
        investasiList,
        { page, limit, totalItems: investasiList.length },
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching investasi data",
      );
    }
  }

  async createInvestasi(req, res) {
    try {
      const { pengajuans_id } = req.params;
      const { nominal_investasi } = req.body;
      const { id: investor_id } = req.user;

      const investasi = await Investasi.createInvestasi(
        pengajuans_id,
        nominal_investasi,
        investor_id,
      );
      return ResponseHelper.created(
        res,
        "Investasi data created successfully",
        investasi,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while creating investasi data",
      );
    }
  } 
}

module.exports = InvestasiController;