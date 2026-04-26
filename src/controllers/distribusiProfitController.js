const responseHelper = require("../utils/index").ResponseHelper;
const DistribusiProfit = require("../models/distribusi_profits");

class DistribusiProfitController {
  async getAllDistribusiProfits(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await DistribusiProfit.getAll(page, limit);
      return responseHelper.withPagination(
        res,
        "Distribusi profits fetched successfully",
        data,
        { page, limit, totalItems: data.length },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(res, "Failed to fetch distribusi profits");
    }
  }

  async getByInvestor(req, res) {
    try {
      const { id: investor_id } = req.user;
      const { page = 1, limit = 10 } = req.query;
      const data = await DistribusiProfit.getByInvestorId(
        investor_id,
        page,
        limit,
      );
      return responseHelper.withPagination(
        res,
        "Distribusi profit data fetched successfully",
        data,
        { page, limit, totalItems: data.length },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching distribusi profit data",
      );
    }
  }

  async getByPenjualanId(req, res) {
    try {
      const { penjualans_id } = req.params;
      const data = await DistribusiProfit.getByPenjualanId(penjualans_id);
      if (!data || data.length === 0) {
        return responseHelper.error(
          res,
          "No distribusi profit found for this penjualan",
          404,
        );
      }
      return responseHelper.success(
        res,
        "Distribusi profit data fetched successfully",
        data,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching distribusi profit data",
      );
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await DistribusiProfit.getById(id);
      if (!data) {
        return responseHelper.error(res, "Distribusi profit not found", 404);
      }
      return responseHelper.success(
        res,
        "Distribusi profit data fetched successfully",
        data,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching distribusi profit data",
      );
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowed = ["pending", "distributed"];
      if (!allowed.includes(status)) {
        return responseHelper.error(
          res,
          `Invalid status. Allowed values: ${allowed.join(", ")}`,
          400,
        );
      }

      const existing = await DistribusiProfit.getById(id);
      if (!existing) {
        return responseHelper.error(res, "Distribusi profit not found", 404);
      }

      const updated = await DistribusiProfit.updateStatus(id, status);
      return responseHelper.success(
        res,
        "Distribusi profit status updated successfully",
        updated,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating distribusi profit status",
      );
    }
  }
}

module.exports = DistribusiProfitController;
