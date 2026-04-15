const responseHelper = require("../utils/response");
const Bisnis = require("../models/bisnis");
const { BisnisValidator, PengajuanValidator } = require("../validation");
const pengajuans = require("../models/pengajuans");
class BisnisController {
  async getBisnis(req, res) {
    try {
      const { page, limit, search } = req.query;
      const bisnisList = await Bisnis.getAllBisnis(page, limit, search);
      return responseHelper.success(
        res,
        "Bisnis data fetched successfully",
        bisnisList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis data",
      );
    }
  }

  async createBisnis(req, res) {
    try {
      const data = req.body;
      const user_id = req.user.id;
      //   console.log(user_id);
      const payload = { ...data, user_id };

      const existingBisnis = await Bisnis.getBisnisByUserId(user_id);
      if (existingBisnis) {
        return responseHelper.error(
          res,
          "User already has a bisnis. Each user can only create one bisnis.",
          400,
        );
      }
      const validate = BisnisValidator.bisnisValidation(payload);

      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const bisnis = await Bisnis.createBisnis(
        payload.nama,
        payload.user_id,
        payload.kelas_id,
        payload.alamat,
        payload.no_telp,
        payload.email,
        payload.deskripsi,
      );
      return responseHelper.created(res, "Bisnis created successfully", bisnis);
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while creating bisnis data",
      );
    }
  }

  async getBisnisById(req, res) {
    try {
      const { id } = req.params;
      const bisnisList = await Bisnis.getBisnisById(id);
      if (!bisnisList) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }
      return responseHelper.success(
        res,
        "Bisnis data fetched successfully",
        bisnisList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis data",
      );
    }
  }

  async getBisnisByUserId(req, res) {
    try {
      const { user_id } = req.params;
      const bisnisList = await Bisnis.getBisnisByUserId(user_id);
      return responseHelper.success(
        res,
        "Bisnis data fetched successfully",
        bisnisList,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis data",
      );
    }
  }

  async updateBisnis(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user;

      const existingBisnis = await Bisnis.getBisnisById(id);
      if (!existingBisnis) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }

      if (existingBisnis.user_id !== user.id) {
        return responseHelper.error(
          res,
          "Unauthorized to update this bisnis",
          403,
        );
      }

      const validate = BisnisValidator.bisnisUpdateValidation(data);
      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }

      const bisnis = await Bisnis.updateBisnis(
        id,
        data.nama,
        data.alamat,
        data.no_telp,
        data.email,
        data.deskripsi,
        data.kelas_id,
      );
      if (!bisnis) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }
      return responseHelper.success(res, "Bisnis updated successfully", bisnis);
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating bisnis data",
      );
    }
  }

  async deleteBisnis(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const existingBisnis = await Bisnis.getBisnisById(id);
      if (!existingBisnis) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }
      if (existingBisnis.user_id !== user.id) {
        return responseHelper.error(
          res,
          "Unauthorized to delete this bisnis",
          403,
        );
      }
      const result = await Bisnis.deleteBisnis(id);
      return responseHelper.success(res, "Bisnis deleted successfully", result);
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while deleting bisnis data",
      );
    }
  }

 
}

module.exports = BisnisController;
