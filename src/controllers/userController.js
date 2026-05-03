const User = require("../models/users");
const responseHelper = require("../utils/response");
const { UserValidator } = require("../validation");

class UserController {
  async getUserProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await User.getUserById(id);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }
      return responseHelper.success(
        res,
        "User profile fetched successfully",
        user,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching user profile",
        500,
      );
    }
  }

  async getInvestorProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await User.getUserProfileInvestor(id);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }
      return responseHelper.success(
        res,
        "Investor profile fetched successfully",
        user,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching investor profile",
        500,
      );
    }
  }

  async updateUserProfile(req, res) {
    try {
      const { id } = req.user;
      const { nama, email, no_telp } = req.body;
      const user = await User.getUserById(id);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }
      //   validate email uniqueness
      if (email && email !== user.email) {
        const checkEmail = await User.getUserByEmail(email);
        if (checkEmail) {
          return responseHelper.error(res, "Email already exists", 400);
        }
      }

      //   validate no_telp uniqueness
      if (no_telp && no_telp !== user.no_telp) {
        const checkNoTelp = await User.getUserByNoTelp(no_telp);
        if (checkNoTelp) {
          return responseHelper.error(res, "Phone number already exists", 400);
        }
      }

      //   validate input
      const validate = UserValidator.userUpdateValidation({
        nama,
        email,
        no_telp,
      });
      if (validate.error) {
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          400,
        );
      }
      const updatedUser = await User.updateUser(id, nama, email, no_telp);
      return responseHelper.success(
        res,
        "User profile updated successfully",
        updatedUser,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while updating user profile",
        500,
      );
    }
  }

  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const users = await User.getAllUsers(page, limit, search);
      return responseHelper.withPagination(
        res,
        "Users fetched successfully",
        users.data,
        { page, limit, totalItems: users.pagination.total, search },
      );
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching users",
        500,
      );
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getUserById(id);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }
      return responseHelper.success(res, "User fetched successfully", user);
    } catch (error) {
      console.error(error);
      return responseHelper.error(
        res,
        "An error occurred while fetching user",
        500,
      );
    }
  }
}

module.exports = UserController;
