const Admin = require("../models/admins");
const { hashPassword } = require("../utils/Bcrypt");
const responseHelper = require("../utils/response");
const AdminValidator = require("../validation/index").AdminValidator;
class AdminController {
  async createAdmin(req, res) {
    try {
      const { nama, email, password, no_telp, level } = req.body;

      const { error } = AdminValidator.adminValidation({
        nama,
        email,
        password,
        no_telp,
        level,
      });
      console.log(error);
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const emailExists = await Admin.getAdminByEmail(email);
      if (emailExists) {
        return responseHelper.error(res, "Email already exists", 400);
      }

      const passwordHash = await hashPassword(password);
      const admin = await Admin.createAdmin(
        nama,
        email,
        passwordHash,
        no_telp,
        level,
      );
      return responseHelper.created(res, "Admin created successfully", admin);
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while creating admin",
        500,
      );
    }
  }

  async getAllAdmins(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const admins = await Admin.getAllAdmins(page, limit, search);

      return responseHelper.withPagination(
        res,
        "Admins fetched successfully",
        admins,
        { page, limit, totalItems: admins.length, search },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching admins",
        500,
      );
    }
  }

  async getAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await Admin.getAdminById(id);
      if (!admin) {
        return responseHelper.error(res, "Admin not found", 404);
      }
      return responseHelper.success(res, "Admin fetched successfully", admin);
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching admin",
        500,
      );
    }
  }

  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const { nama, email, no_telp, level } = req.body;
      const admin = await Admin.getAdminById(id);
      if (!admin) {
        return responseHelper.error(res, "Admin not found", 404);
      }
      const emailExists = await Admin.getAdminByEmail(email);
      if (emailExists && emailExists.id !== parseInt(id)) {
        return responseHelper.error(res, "Email already exists", 400);
      }

      const { error } = AdminValidator.adminUpdateValidation({
        nama,
        email,
        no_telp,
        level,
      });
      console.log(error);
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      await Admin.updateAdmin(id, nama, email, no_telp, level);
      const updatedAdmin = await Admin.getAdminById(id);
      return responseHelper.success(
        res,
        "Admin updated successfully",
        updatedAdmin,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while updating admin",
        500,
      );
    }
  }

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      const admin = await Admin.getAdminById(id);
      if (!admin) {
        return responseHelper.error(res, "Admin not found", 404);
      }
      await Admin.deleteAdmin(id);
      return responseHelper.success(res, "Admin deleted successfully");
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while deleting admin",
        500,
      );
    }
  }
}

module.exports = AdminController;
