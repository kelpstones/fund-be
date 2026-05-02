const investasi = require("../models/investasi");

const { ResponseHelper } = require("../utils/index");

class InvestasiController {
  async getAllInvestasi(req, res) {
    try {
      const { page = 1, limit = 10, startDate, endDate } = req.query;
      const investasiList = await investasi.getAllInvestasi(
        page,
        limit,
        startDate,
        endDate,
      );
      return ResponseHelper.withPagination(
        res,
        "Investasi data fetched successfully",
        investasiList,
        { page, limit, totalItems: investasiList.length, startDate, endDate },
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching investasi data",
      );
    }
  }

  async getInvestasiByPengajuanId(req, res) {
    try {
      // const { pengajuans_id } = req.query;
      // console.log("Pengajuans ID:", pengajuans_id); // Debugging log
      const { page = 1, limit = 10, pengajuans_id } = req.query;
      const investasiList = await investasi.getInvestasiByPengajuanId(
        pengajuans_id,
        page,
        limit
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

  async getInvestasiById(req, res) {
    try {
      const { id } = req.params;
      const investasis = await investasi.getInvestasiById(id);
      if (!investasis) {
        return ResponseHelper.error(res, "Investasi not found", 404);
      }
      return ResponseHelper.success(
        res,
        "Investasi data fetched successfully",
        investasis,
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching the investasi data",
      );
    }
  }

  async getInvestasiByInvestorId(req, res) {
    try {
      const { id: investor_id } = req.user;
      const { page, limit, startDate, endDate } = req.query;
      const investasiList = await investasi.getInvestasiByUserId(
        investor_id,
        "investor",
        page,
        limit,
        startDate,
        endDate,
      );
      return ResponseHelper.withPagination(
        res,
        "Investasi data fetched successfully",
        investasiList,
        { page, limit, startDate, endDate },
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.serverError(
        res,
        "An error occurred while fetching investasi data",
      );
    }
  }
}

module.exports = InvestasiController;
