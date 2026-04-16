const responseHelper = require("../utils/response");
const Negosiasis = require("../models/negosiasis");
const LogNegosiasis = require("../models/log_negosiasis");
const pengajuans = require("../models/pengajuans");
const { NegotiationValidator } = require("../validation");
class NegotiationController {
  async getAllNegotiations(req, res) {
    try {
      const { page, limit, status } = req.query;
      const negosiasiList = await Negosiasis.getAllNegosiasis(
        page,
        limit,
        status,
      );
      return responseHelper.withPagination(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList,
        { page, limit, totalItems: negosiasiList.length, status },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async startNegotiation(req, res) {
    try {
      const { pengajuans_id, penawaran_return, catatan } = req.body;
      const { id: investor_id } = req.user;

      //   cek pengajuan
      const pengajuan = await pengajuans.getPengajuanById(pengajuans_id);
      if (!pengajuan || pengajuan.status !== "published") {
        return responseHelper.error(
          res,
          "Pengajuan not found or not published",
          404,
        );
      }

      //   cek negosiasi aktif
      const activeNegosiasi =
        await Negosiasis.getNegosiasiByPengajuanId(pengajuans_id);
      if (
        activeNegosiasi.length !== 0 &&
        activeNegosiasi.some((n) => n.status === "active")
      ) {
        return responseHelper.error(
          res,
          "An active negotiation already exists for this pengajuan",
          400,
        );
      }

      //   validation
      const { error } = NegotiationValidator.negotiationValidation({
        pengajuans_id,
        penawaran_return,
        catatan,
      });
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      //   create negosiasi
      const [negosiasi] = await Negosiasis.createNegosiasi(
        pengajuans_id,
        investor_id,
        "active",
        investor_id,
      );

      const log_negosiasi = await LogNegosiasis.createLogNegosiasi(
        negosiasi.id,
        investor_id,
        penawaran_return,
        catatan,
      );
      return responseHelper.success(res, "Negotiation started successfully", {
        negosiasi,
        log_negosiasi,
      });
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while creating negosiasi data",
      );
    }
  }

  async getNegotiationByPengajuanId(req, res) {
    try {
      const { id: pengajuans_id } = req.params;
      const negosiasiList =
        await Negosiasis.getNegosiasiByPengajuanId(pengajuans_id);
      if (!negosiasiList || negosiasiList.length === 0) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async getNegotiationByUserId(req, res) {
    try {
      const { id: user_id } = req.user;
      const role = req.user.role_name;
      const negosiasiList = await Negosiasis.getNegosiasiByUserId(
        user_id,
        role,
      );
      if (!negosiasiList || negosiasiList.length === 0) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasiList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async getNegotiationById(req, res) {
    try {
      const { id } = req.params;
      const negosiasi = await Negosiasis.getNegosiasiById(id);
      if (!negosiasi) {
        return responseHelper.error(res, "Negosiasi not found", 404);
      }
      return responseHelper.success(
        res,
        "Negosiasi data fetched successfully",
        negosiasi,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching negosiasi data",
      );
    }
  }

  async replyNegotiation(req, res) {
    try {
      const { id: negosiasi_id } = req.params;
      const { penawaran_return, catatan } = req.body;
      const { id: user_id } = req.user;
      const negosiasi = await Negosiasis.getNegosiasiById(negosiasi_id);
      if (!negosiasi || negosiasi.status !== "active") {
        return responseHelper.error(
          res,
          "Negosiasi not found or not active",
          404,
        );
      }

      //   validation
      const { error } = NegotiationValidator.replyNegotiationValidation({
        penawaran_return,
        catatan,
      });
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const log_negosiasi = await LogNegosiasis.createLogNegosiasi(
        negosiasi_id,
        user_id,
        penawaran_return,
        catatan,
      );

      await Negosiasis.updateNegosiasi(negosiasi_id, "active", user_id);
      return responseHelper.success(res, "Reply to negotiation successfully", {
        log_negosiasi,
      });
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while replying to negosiasi",
      );
    }
  }

  async acceptNegotiation(req, res) {
    try {
      const { id: negosiasi_id } = req.params;
      const { catatan } = req.body;
      const { id: user_id } = req.user;
      const negosiasi = await Negosiasis.getNegosiasiById(negosiasi_id);
      if (!negosiasi || negosiasi.status !== "active") {
        return responseHelper.error(
          res,
          "Negosiasi not found or not active",
          404,
        );
      }
      //   validation
      const { error } = NegotiationValidator.acceptNegotiationValidation({
        catatan,
      });
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }
      await Negosiasis.updateNegosiasi(negosiasi_id, "deal", user_id);
      await pengajuans.updatePengajuanStatus(negosiasi.pengajuans_id, "funded");
      return responseHelper.success(res, "Negotiation accepted successfully");
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while accepting negosiasi",
      );
    }
  }
}

module.exports = NegotiationController;
