const responseHelper = require("../utils/response");
const Bisnis = require("../models/bisnis");
const { BisnisValidator } = require("../validation");
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

      const validate = BisnisValidator.bisnisValidation(data);

      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const bisnis = await Bisnis.createBisnis(
        nama,
        user_id,
        alamat,
        no_telp,
        email,
        deskripsi,
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
}

module.exports = BisnisController;
