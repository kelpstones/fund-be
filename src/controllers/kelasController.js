const Kelas = require("../models/kelas");
const { KelasValidator } = require("../validation");
const responseHelper = require("../utils/index").ResponseHelper;
class KelasController {
  async getAllKelas(req, res) {
    try {
      const { page, limit, search } = req.query;
      const kelasList = await Kelas.getAllKelas(page, limit, search);
      return responseHelper.withPagination(
        res,
        "Kelas data fetched successfully",
        kelasList,
        { page, limit, totalItems: kelasList.length, search },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching kelas data",
      );
    }
  }

  async createKelas(req, res) {
    try {
      const data = req.body;
      const validate = KelasValidator.kelasValidation(data);

      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const kelas = await Kelas.createKelas(data.nama_kelas, data.deskripsi);
      return responseHelper.created(res, "Kelas created successfully", kelas);
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while creating kelas data",
      );
    }
  }

  async getKelasById(req, res) {
    try {
      const { id } = req.params;
      const kelas = await Kelas.getKelasById(id);
      if (!kelas) {
        return responseHelper.error(res, "Kelas not found", 404);
      }
      return responseHelper.success(
        res,
        "Kelas data fetched successfully",
        kelas,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching kelas data",
      );
    }
  }

  async updateKelas(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const validate = KelasValidator.kelasValidation(data);

      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }

      const kelas = await Kelas.updateKelas(id, data);
      if (!kelas) {
        return responseHelper.notFound(res, "Kelas not found");
      }
      return responseHelper.success(
        res,
        "Kelas data updated successfully",
        kelas,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating kelas data",
      );
    }
  }

  async deleteKelas(req, res) {
    try {
      const { id } = req.params;
      const kelas = await Kelas.deleteKelas(id);
      if (!kelas) {
        return responseHelper.notFound(res, "Kelas not found");
      }
      return responseHelper.success(
        res,
        "Kelas data deleted successfully",
        kelas,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while deleting kelas data",
      );
    }
  }
}

module.exports = KelasController;
