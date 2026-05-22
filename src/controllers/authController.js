// authController.js

const crypto = require("crypto");
const responseHelper = require("../utils/response");
const User = require("../models/users");
const { AuthValidator, PasswordResetValidator } = require("../validation");
const { hashPassword, comparePassword } = require("../utils/Bcrypt");
const { generateToken, generateAdminToken, verifyRefreshToken } =
  require("../utils/index").JwtUtils;
const VerifyEmail = require("../models/verify_email");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/mailer");
const admins = require("../models/admins");
const knex = require("../config/db");
const password_resets = require("../models/password_resets");
const refresh_tokens = require("../models/refresh_tokens");
const logger = require("../utils/index").logger;
class AuthController {
  async register(req, res) {
    // const trx = await knex.transaction();
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
        // await trx.rollback();

        return responseHelper.error(res, validate.message, validate.code);
      }
      const checkEmail = await User.getUserByEmail(email);
      if (checkEmail) {
        // await trx.rollback();

        return responseHelper.error(res, "Email already exists", 400);
      }
      const checkNik = await User.getUserByNik(nik);
      if (checkNik) {
        // await trx.rollback();
        return responseHelper.error(res, "NIK already exists", 400);
      }
      const checkNoTelp = await User.getUserByNoTelp(no_telp);
      if (checkNoTelp) {
        // await trx.rollback();
        return responseHelper.error(res, "Phone number already exists", 400);
      }
      // await trx.commit();
      const passwordHash = await hashPassword(password);
      const newUser = await knex.transaction(async (trx) => {
        const user = await User.createUser(
          nama,
          email,
          passwordHash,
          nik,
          no_telp,
          role_id,
          trx,
        );
        const token = crypto.randomBytes(32).toString("hex");
        await VerifyEmail.createToken(user.id, token, trx);
        return { user, token };
      });

      sendVerificationEmail(
        newUser.user.email,
        newUser.user.nama,
        newUser.token,
      ).catch((err) =>
        logger.error("Failed to send verification email", { err }),
      );
      return responseHelper.created(
        res,
        "Registrasi berhasil, cek email untuk verifikasi",
        newUser.user,
      );
    } catch (error) {
      // await trx.rollback();
      logger.error("An error occurred while registering user", { error });
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

      const user = await User.updateUser(record.user_id, {
        email_verified: true,
      });
      await VerifyEmail.deleteByUserId(record.user_id);
      const tokenJWT = await generateToken(user);
      return responseHelper.success(
        res,
        "Email has been verified successfully",
        { token: tokenJWT },
      );
    } catch (error) {
      logger.error("An error occurred while verifying email", { error });
      responseHelper.serverError(res, error);
    }
  }

  async resendVerification(req, res) {
    const trx = await knex.transaction();
    try {
      const { email } = req.body;

      const user = await User.getUserByEmail(email);
      if (!user) return responseHelper.error(res, "Email not found", 404);
      if (user.email_verified)
        return responseHelper.error(
          res,
          "Email has already been verified",
          400,
        );

      const token = crypto.randomBytes(32).toString("hex");
      await VerifyEmail.createToken(user.id, token, trx);

      await trx.commit();

      sendVerificationEmail(user.email, user.nama, token).catch((err) =>
        logger.error("Failed to send verification email", { err }),
      );

      return responseHelper.success(
        res,
        "Email verification successfully resent, please check your email",
      );
    } catch (error) {
      await trx.rollback();
      logger.error("An error occurred while resending verification email", {
        error,
      });
      responseHelper.serverError(res, error);
    }
  }

  async login(req, res) {
    const trx = await knex.transaction();
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });
      if (!validate.status) {
        await trx.rollback();
        return responseHelper.error(res, validate.message, validate.code);
      }
      const user = await User.getUserByEmail(email, trx);
      if (!user) {
        await trx.rollback();
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      if (!user.email_verified) {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Email has not been verified, please verify your email first",
          403,
        );
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        await trx.rollback();
        return responseHelper.error(res, "Invalid email or password", 401);
      }

      const accessToken = await generateToken(user);
      const refreshToken = await refresh_tokens.createToken(
        user.id,
        "users",
        trx,
      );
      const data = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        is_onboarded: user.is_onboarded,
        role: { id: user.role.id, nama_role: user.role.nama_role },
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      await trx.commit();
      return responseHelper.successLogin(
        res,
        "Login successful",
        data,
        accessToken,
        refreshToken,
      );
    } catch (error) {
      logger.error("An error occurred while logging in", { error });
      responseHelper.serverError(res, error);
    }
  }

  async authMe(req, res) {
    try {
      const id = req.user.id;
      const user = await User.getUserById(id);
      if (!user) return responseHelper.error(res, "User not found", 404);

      const data = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        is_onboarded: user.is_onboarded,
        saldo: user.saldo,
        role: { id: user.role.id, nama_role: user.role.nama_role },
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return responseHelper.success(
        res,
        "User data retrieved successfully",
        data,
      );
    } catch (error) {
      logger.error("An error occurred while retrieving user data", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // validasi input
      const validate = PasswordResetValidator.requestPasswordResetValidation({
        email,
      });
      if (!validate.status)
        return responseHelper.error(res, validate.message, validate.code);

      const user = await User.getUserByEmail(email);
      if (!user) return responseHelper.error(res, "Email tidak ditemukan", 404);
      if (!user.email_verified)
        return responseHelper.error(
          res,
          "Email has not been verified, cannot reset password",
          403,
        );

      const existingToken = await password_resets.existsValidTokenForUser(
        user.id,
      );
      if (existingToken) {
        return responseHelper.error(
          res,
          "A valid password reset token already exists for this user, please check your email",
          400,
        );
      }
      const token = crypto.randomBytes(32).toString("hex");
      await password_resets.createToken(user.id, token);
      await sendPasswordResetEmail(user.email, user.nama, token);
      return responseHelper.success(
        res,
        "Password reset request successful, please check your email",
      );
    } catch (error) {
      logger.error(
        "An error occurred while processing forgot password request",
        { error },
      );
      return responseHelper.serverError(
        res,
        "An error occurred while processing forgot password request",
      );
    }
  }

  async resetPassword(req, res) {
    const trx = await knex.transaction();
    try {
      const { token, new_password, password_confirmation } = req.body;

      // validasi input
      const validate = PasswordResetValidator.resetPasswordValidation({
        token,
        new_password,
        password_confirmation,
      });
      if (!validate.status) {
        logger.error("Validation error:", validate);
        await trx.rollback();
        return responseHelper.error(
          res,
          validate.error.details[0].message,
          validate.code,
        );
      }

      const validToken = await password_resets.findValidToken(token);
      if (!validToken)
        return responseHelper.error(res, "Invalid or expired reset token", 400);

      const hashedPassword = await hashPassword(new_password);
      await User.updatePassword(validToken.user_id, hashedPassword, trx);
      await password_resets.deleteToken(token, trx);

      await trx.commit();
      return responseHelper.success(res, "Password reset successful");
    } catch (error) {
      logger.error("An error occurred while resetting password", { error });
      await trx.rollback();
      return responseHelper.serverError(
        res,
        "An error occurred while resetting password",
      );
    }
  }

  async loginAdmin(req, res) {
    const trx = await knex.transaction();
    try {
      const { email, password } = req.body;
      const validate = AuthValidator.loginValidation({ email, password });

      if (!validate.status) {
        await trx.rollback();
        return responseHelper.error(res, validate.message, validate.code);
      }
      const admin = await admins.getAdminByEmail(email, trx);
      if (!admin) {
        await trx.rollback();
        return responseHelper.error(res, "Invalid email or password", 401);
      }
      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid) {
        await trx.rollback();
        return responseHelper.error(res, "Invalid email or password", 401);
      }

      const accessToken = await generateAdminToken(admin);
      const refreshToken = await refresh_tokens.createToken(
        admin.id,
        "admins",
        trx,
      );
      const adminData = {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        no_telp: admin.no_telp,
        level: admin.level,
        created_at: admin.created_at,
      };

      await trx.commit();
      return responseHelper.successLogin(
        res,
        "Login successful",
        adminData,
        accessToken,
        refreshToken,
      );
    } catch (error) {
      logger.error("An error occurred while logging in as admin", { error });
      await trx.rollback();
      responseHelper.serverError(res, error);
    }
  }

  async authMeAdmin(req, res) {
    try {
      const id = req.admin.id;
      const admin = await admins.getAdminById(id);
      if (!admin) return responseHelper.error(res, "Admin not found", 404);

      const adminData = {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        no_telp: admin.no_telp,
        level: admin.level,
        created_at: admin.created_at,
      };

      return responseHelper.success(
        res,
        "Admin data retrieved successfully",
        adminData,
      );
    } catch (error) {
      logger.error("An error occurred while retrieving admin data", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return responseHelper.error(res, "refreshToken is required", 400);
      }

      const record = await refresh_tokens.findValid(refreshToken);
      if (!record) {
        return responseHelper.unauthorized(
          res,
          "Invalid or expired refresh token",
        );
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        logger.warn("Refresh token cryptographic verification failed", { err });
        return responseHelper.unauthorized(
          res,
          "Invalid or expired refresh token",
        );
      }

      let accessToken;
      let newRefreshToken;
      let responseData;

      await knex.transaction(async (trx) => {
        if (record.owner_type === "users") {
          const user = await User.getUserById(record.owner_id, trx);
          if (!user) {
            throw new Error("User not found");
          }

          accessToken = await generateToken(user);
          newRefreshToken = await refresh_tokens.createToken(
            user.id,
            "users",
            trx,
          );

          responseData = {
            id: user.id,
            nama: user.nama,
            email: user.email,
            is_onboarded: user.is_onboarded,
            role: { id: user.role.id, nama_role: user.role.nama_role },
            created_at: user.created_at,
            updated_at: user.updated_at,
          };
        } else if (record.owner_type === "admins") {
          const adminObj = await admins.getAdminById(record.owner_id, trx);
          if (!adminObj) {
            throw new Error("Admin not found");
          }

          accessToken = await generateAdminToken(adminObj);
          newRefreshToken = await refresh_tokens.createToken(
            adminObj.id,
            "admins",
          );

          responseData = {
            id: adminObj.id,
            nama: adminObj.nama,
            email: adminObj.email,
            no_telp: adminObj.no_telp,
            level: adminObj.level,
            created_at: adminObj.created_at,
          };
        } else {
          throw new Error("Unknown token owner type");
        }

        await refresh_tokens.revokeToken(refreshToken, trx);
      });

      return responseHelper.successLogin(
        res,
        "Token refreshed successfully",
        responseData,
        accessToken,
        newRefreshToken,
      );
    } catch (error) {
      logger.error("An error occurred during token refresh", { error });
      if (
        error.message === "User not found" ||
        error.message === "Admin not found"
      ) {
        return responseHelper.unauthorized(res, error.message);
      }
      return responseHelper.serverError(res, error);
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body || {};
      if (!refreshToken) {
        return responseHelper.error(res, "Refresh token is required", 400);
      }

      const record = await refresh_tokens.findValid(refreshToken);
      if (record) {
        await refresh_tokens.revokeToken(refreshToken);
      }

      return responseHelper.success(res, "Logged out successfully");
    } catch (error) {
      logger.error("An error occurred during logout", { error });
      return responseHelper.serverError(res, error);
    }
  }
}

module.exports = AuthController;
