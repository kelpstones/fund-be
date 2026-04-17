const responseHelper = require("../utils/response");
const User = require("../models/users");
const { AuthValidator } = require("../validation");
const { hashPassword, comparePassword } = require("../utils/Bcrypt");
const { generateToken, refreshToken, generateAdminToken, refreshAdminToken } = require("../utils/index").JwtUtils;
const admins = require("../models/admins");

class AuthController {
  async register(req, res) {
    try {
      const { nama, email, password, password_confirmation, nik, role_id } =
        req.body;

      const validate = AuthValidator.registerValidation({
        nama,
        email,
        password,
        password_confirmation,
        nik,
        role_id,
      });

      if (!validate.status) {
        console.log(validate);
        return responseHelper.error(res, validate.message, validate.code);
      }

      const checkEmail = await User.getUserByEmail(email);
      if (checkEmail) {
        return responseHelper.error(res, "Email already exists", 400);
      }

      const passwordHash = await hashPassword(password);
      const user = await User.createUser(
        nama,
        email,
        passwordHash,
        nik,
        role_id,
      );
      return responseHelper.created(res, "User registered successfully", user);
    } catch (error) {
      responseHelper.serverError(res, error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });
      if (!validate.status) {
        return responseHelper.error(res, validate.message, validate.code);
      }
      const user = await User.getUserByEmail(email);
      if (!user) {
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      const token = await generateToken(user);

      const data = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role_name,
        role_id: user.role_id,
        created_at: user.created_at,
      };

      return responseHelper.successLogin(res, "Login successful", data, token);
    } catch (error) {
      console.error(error);
      responseHelper.serverError(res, error);
    }
  }

  async authMe(req, res) {
    try {
      const id = req.user.id;
      const user = await User.getUserById(id);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }
      const userData = await User.getUserById(user.id);
      const refreshed = refreshToken(user);
      // console.log("Refreshed token:", refreshed);
      return responseHelper.successLogin(
        res,
        "Token refreshed",
        userData,
        refreshed,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(res, "Failed to retrieve user data");
    }
  }

  // admin
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });
      if (!validate.status) {
        return responseHelper.error(res, validate.message, validate.code);
      }
      const admin = await admins.getAdminByEmail(email);
      if (!admin) {
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid) {
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      const token = await generateAdminToken(admin);

      const adminData = {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        no_telp: admin.no_telp,
        level: admin.level,
        created_at: admin.created_at,
      }
      return responseHelper.successLogin(res, "Login successful", adminData, token);
    } catch (error) {
      console.error(error);
      responseHelper.serverError(res, error);
    }
  }

    async authMeAdmin(req, res) {
      try {
        const id = req.admin.id;
        const admin = await admins.getAdminById(id);
        if (!admin) {
          return responseHelper.error(res, "Admin not found", 404);
        }
        const adminData = await admins.getAdminById(admin.id);
        const refreshed = refreshAdminToken(admin);
        return responseHelper.successLogin(
          res,
          "Token refreshed",
          adminData,
          refreshed,
        );
      } catch (error) {
        console.error(error);
        responseHelper.serverError(res, error);
      }
    }
}

module.exports = AuthController;
