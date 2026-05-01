// authController.js

const crypto = require("crypto"); // ✅ import crypto
const responseHelper = require("../utils/response");
const User = require("../models/users");
const { AuthValidator } = require("../validation");
const { hashPassword, comparePassword } = require("../utils/Bcrypt");
const { generateToken, refreshToken, generateAdminToken, refreshAdminToken } =
  require("../utils/index").JwtUtils;
const VerifyEmail = require("../models/verify_email");
const { sendVerificationEmail } = require("../utils/mailer"); // ✅ import mailer
const admins = require("../models/admins");
const knex = require("../config/db");

class AuthController {
  async register(req, res) {
    const trx = await knex.transaction();
    try {
      const {
        nama,
        email,
        password,
        password_confirmation,
        nik,
        no_telp,
        role_id,
      } = req.body;

      const validate = AuthValidator.registerValidation({
        nama,
        email,
        password,
        password_confirmation,
        nik,
        no_telp,
        role_id,
      });
      if (!validate.status) {
        await trx.rollback();

        return responseHelper.error(res, validate.message, validate.code);
      }
      const checkEmail = await User.getUserByEmail(email);
      if (checkEmail) {
        await trx.rollback();

        return responseHelper.error(res, "Email already exists", 400);
      }
      const checkNik = await User.getUserByNik(nik);
      if (checkNik) {
        await trx.rollback();
        return responseHelper.error(res, "NIK already exists", 400);
      }
      const checkNoTelp = await User.getUserByNoTelp(no_telp);
      if (checkNoTelp) {
        await trx.rollback();
        return responseHelper.error(res, "Phone number already exists", 400);
      }

      const passwordHash = await hashPassword(password);
      const newUser = await User.createUser(
        nama,
        email,
        passwordHash,
        nik,
        no_telp,
        role_id,
        // trx,
      );
      // await trx.commit();

      const token = crypto.randomBytes(32).toString("hex");
      await VerifyEmail.createToken(newUser.id, token);
      await sendVerificationEmail(newUser.email, newUser.nama, token);
      return responseHelper.created(
        res,
        "Registrasi berhasil, cek email untuk verifikasi",
        newUser,
      );
    } catch (error) {
      await trx.rollback();
      console.error(error);
      responseHelper.serverError(res, error);
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      if (!token) return responseHelper.error(res, "Token tidak valid", 400);

      const record = await VerifyEmail.findValidToken(token);
      if (!record)
        return responseHelper.error(
          res,
          "Token expired atau tidak ditemukan",
          400,
        );

      await User.updateUser(record.user_id, { email_verified: true }); // ✅ tandai verified
      await VerifyEmail.deleteByUserId(record.user_id); // ✅ hapus token

      return responseHelper.success(res, "Email berhasil diverifikasi");
    } catch (error) {
      responseHelper.serverError(res, error);
    }
  }

  async resendVerification(req, res) {
    const trx = await knex.transaction();
    try {
      const { email } = req.body;

      const user = await User.getUserByEmail(email);
      if (!user) return responseHelper.error(res, "Email tidak ditemukan", 404);
      if (user.email_verified)
        return responseHelper.error(res, "Email sudah terverifikasi", 400);

      const token = crypto.randomBytes(32).toString("hex");
      await VerifyEmail.createToken(user.id, token, trx);
      await sendVerificationEmail(user.email, user.nama, token);

      return responseHelper.success(
        res,
        "Email verifikasi berhasil dikirim ulang",
      );
    } catch (error) {
      await trx.rollback();
      console.error(error);
      responseHelper.serverError(res, error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });
      if (!validate.status)
        return responseHelper.error(res, validate.message, validate.code);

      const user = await User.getUserByEmail(email);
      if (!user)
        return responseHelper.error(res, "Invalid email or password", 401);

      if (!user.email_verified)
        return responseHelper.error(
          res,
          "Email belum diverifikasi, cek inbox kamu",
          403,
        );

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid)
        return responseHelper.error(res, "Invalid email or password", 401);

      const token = await generateToken(user);
      const data = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        is_onboarded: user.is_onboarded,
        role: { id: user.role.id, nama_role: user.role.nama_role },
        created_at: user.created_at,
        updated_at: user.updated_at,
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
      if (!user) return responseHelper.error(res, "User not found", 404);

      const refreshed = refreshToken(user); // ✅ hapus duplikasi getUserById
      return responseHelper.successLogin(
        res,
        "Token refreshed",
        user,
        refreshed,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(res, "Failed to retrieve user data");
    }
  }

  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });
      if (!validate.status)
        return responseHelper.error(res, validate.message, validate.code);

      const admin = await admins.getAdminByEmail(email);
      if (!admin)
        return responseHelper.error(res, "Invalid email or password", 401);

      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid)
        return responseHelper.error(res, "Invalid email or password", 401);

      const token = await generateAdminToken(admin);
      const adminData = {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        no_telp: admin.no_telp,
        level: admin.level,
        created_at: admin.created_at,
      };

      return responseHelper.successLogin(
        res,
        "Login successful",
        adminData,
        token,
      );
    } catch (error) {
      console.error(error);
      responseHelper.serverError(res, error);
    }
  }

  async authMeAdmin(req, res) {
    try {
      const id = req.admin.id;
      const admin = await admins.getAdminById(id);
      if (!admin) return responseHelper.error(res, "Admin not found", 404);

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
