const responseHelper = require("../utils/response");
const Pengajuan = require("../models/pengajuans");
const { PengajuanValidator } = require("../validation");
const bisnis = require("../models/bisnis");

class PengajuanController {
  // pengajuan
  async createPengajuan(req, res) {
    try {
      const { bisnis_id } = req.params;
      const data = req.body;
      const payload = { ...data, bisnis_id };

      const bisnisCheck = await bisnis.getBisnisById(bisnis_id);
      if (!bisnisCheck) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }
      //   check bisnis_id exist
      const existingPengajuan =
        await PengajuanValidator.checkBisnisIdExist(bisnis_id);
      if (!existingPengajuan.status) {
        return responseHelper.error(
          res,
          existingPengajuan.message,
          existingPengajuan.code,
        );
      }

      const validate = PengajuanValidator.pengajuanValidation(payload);
      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const pengajuan = await Pengajuan.createPengajuan(
        payload.bisnis_id,
        payload.target_pendanaan,
        "draft",
        0,
        payload.per_anual_return,
      );
      return responseHelper.success(
        res,
        "Pengajuan created successfully",
        pengajuan,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while creating pengajuan data",
      );
    }
  }

  async getAllPengajuan(req, res) {
    try {
      const pengajuanList = await Pengajuan.getAllPengajuans();
      return responseHelper.success(
        res,
        "Pengajuan data fetched successfully",
        pengajuanList,
      );
    } catch (error) {
      console.error(error, "pengajuanController getAllPengajuan");
      return responseHelper.serverError(
        res,
        "An error occurred while fetching pengajuan data",
      );
    }
  }

  async getPengajuanByBisnisId(req, res) {
    try {
      const { bisnis_id } = req.params;
      const pengajuanList = await Pengajuan.getPengajuanByBisnisId(bisnis_id);
      console.log(pengajuanList);
      
      if (!pengajuanList) {
        return responseHelper.error(
          res,
          "No pengajuan found for this bisnis",
          404,
        );
      }
      return responseHelper.success(
        res,
        "Pengajuan data fetched successfully",
        pengajuanList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching pengajuan data",
      );
    }
  }

  async updatePengajuan(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingPengajuan = await Pengajuan.getPengajuanById(id);
      if (!existingPengajuan) {
        return responseHelper.error(res, "Pengajuan not found", 404);
      }

      const updatedPengajuan = await Pengajuan.updatePengajuan(id, { status });
      return responseHelper.success(
        res,
        "Pengajuan updated successfully",
        updatedPengajuan,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating pengajuan data",
      );
    }
  }

  async deletePengajuan(req, res) {
    try {
      const { id } = req.params;

      const existingPengajuan = await Pengajuan.getPengajuanById(id);
      if (!existingPengajuan) {
        return responseHelper.error(res, "Pengajuan not found", 404);
      }
      await Pengajuan.deletePengajuan(id);
      return responseHelper.success(res, "Pengajuan deleted successfully");
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while deleting pengajuan data",
      );
    }
  }
}

module.exports = PengajuanController;
