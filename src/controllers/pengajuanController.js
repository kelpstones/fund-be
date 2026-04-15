const responseHelper = require("../utils/response");
const Pengajuan = require("../models/pengajuans");
const { PengajuanValidator } = require("../validation");
const bisnis = require("../models/bisnis");
const approvals = require("../models/approvals");

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
      const approval = await approvals.createApproval(
        pengajuan[0].id,
        null,
        "pending",
        null,
      );
      const final = {
        ...pengajuan[0],
        approvals: approval[0],
      };
      return responseHelper.success(
        res,
        "Pengajuan created successfully",
        final,
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
      const { page = 1, limit = 10, status } = req.query;
      const pengajuanList = await Pengajuan.getAllPengajuans(
        page,
        limit,
        status,
      );
      return responseHelper.withPagination(
        res,
        "Pengajuan data fetched successfully",
        pengajuanList,
        { page, limit, totalItems: pengajuanList.length },
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
      const { target_pendanaan, per_anual_return, total_pendanaan } = req.body;

      const existingPengajuan = await Pengajuan.getPengajuanById(id);
      if (!existingPengajuan) {
        return responseHelper.error(res, "Pengajuan not found", 404);
      }
      const validate = PengajuanValidator.updatePengajuanValidation(req.body);
      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const updatedPengajuan = await Pengajuan.updatePengajuan(
        id,
        target_pendanaan,
        total_pendanaan,
        per_anual_return,
      );
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

  async updateApprovalStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, catatan } = req.body;
      const existingApproval = await approvals.getApprovalByPengajuanId(id);
      if (!existingApproval) {
        return responseHelper.error(res, "Approval not found", 404);
      }

      if (!["approved", "rejected", "pending"].includes(status)) {
        return responseHelper.error(
          res,
          "Invalid status value. Allowed values are: approved, rejected, pending",
          400,
        );
      }

      if (status == "rejected") {
        await Pengajuan.updatePengajuanStatus(
          existingApproval.pengajuans_id,
          "rejected",
        );
      }

      const updatedApproval = await approvals.updateApproval(
        id,
        status,
        catatan,
      );
      await Pengajuan.updatePengajuanStatus(
        existingApproval.pengajuans_id,
        "published",
      );
      return responseHelper.success(
        res,
        "Approval status updated successfully",
        updatedApproval,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating approval status",
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
