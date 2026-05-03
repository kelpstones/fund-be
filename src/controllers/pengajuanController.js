const responseHelper = require("../utils/index").ResponseHelper;
const Pengajuan = require("../models/pengajuans");
const { PengajuanValidator } = require("../validation");
const bisnis = require("../models/bisnis");
const Approvals = require("../models/approvals");
const notificationHelper = require("../utils/index").NotificationHelper;
const logger = require("../utils/index").logger;
class PengajuanController {
  // pengajuan
  async createPengajuan(req, res) {
    try {
      // const { bisnis_id } = req.params;
      const data = req.body;
      const payload = { ...data };

      const bisnisCheck = await bisnis.getBisnisById(payload.bisnis_id);
      if (!bisnisCheck) {
        logger.error("Bisnis not found", { bisnis_id: payload.bisnis_id });
        return responseHelper.error(res, "Bisnis not found", 404);
      }
      //   check bisnis_id exist
      const existingPengajuan =
        await PengajuanValidator.checkBisnisIdExist(payload.bisnis_id);
      if (!existingPengajuan.status) {
        logger.error(existingPengajuan.message, { bisnis_id: payload.bisnis_id });
        return responseHelper.error(
          res,
          existingPengajuan.message,
          existingPengajuan.code,
        );
      }

      const validate = PengajuanValidator.pengajuanValidation(payload);
      if (validate.error) {
        logger.error("Invalid pengajuan data", { error: validate.error });
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
      const approval = await Approvals.createApproval(
        pengajuan.id,
        null,
        "pending",
        null,
      );
      const final = {
        ...pengajuan,
        approvals: approval,
      };
      await notificationHelper.notifyAdminNewPengajuan(
        payload.bisnis_id,
        pengajuan.id,
      );
      return responseHelper.success(
        res,
        "Pengajuan created successfully",
        final,
      );
    } catch (error) {
      logger.error("An error occurred while creating pengajuan data", { error });
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
      logger.error("An error occurred while fetching pengajuan data", { error });
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
      logger.error("An error occurred while fetching pengajuan data", { error });
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
      logger.error("An error occurred while updating pengajuan data", { error });
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
      const { id: approver_id } = req.admin;
      //   console.log(approver_id, status, catatan);
      //   return console.log(approver_id);
      const existingApproval = await Approvals.getApprovalByPengajuanId(id);
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

      const updatedApproval = await Approvals.updateApproval(
        existingApproval.id,
        {
          approver_id,
          status,
          catatan,
        },
      );
      // console.log(existingApproval);
      await Pengajuan.updatePengajuanStatus(
        existingApproval.pengajuans_id,
        "published",
      );
      await notificationHelper.notifyUserPengajuanStatus(
        existingApproval.pengajuans_id,
        status,
      );
      return responseHelper.success(
        res,
        "Approval status updated successfully",
        updatedApproval,
      );
    } catch (error) {
      logger.error("An error occurred while updating approval status", { error });
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
      logger.error("An error occurred while deleting pengajuan data", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while deleting pengajuan data",
      );
    }
  }
}

module.exports = PengajuanController;
