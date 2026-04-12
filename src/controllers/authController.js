const responseHelper = require("../utils/response");
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const { AuthValidator } = require("../validation");
const { hashPassword, comparePassword } = require("../utils/Bcrypt");
const { generateToken } = require("../utils/jwt");
class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, password_confirmation, role_id } =
        req.body;

      const validate = AuthValidator.registerValidation({
        name,
        email,
        password,
        password_confirmation,
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
      const user = await User.createUser(name, email, passwordHash, role_id);
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
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      };

      return responseHelper.successLogin(res, "Login successful", data, token);
    } catch (error) {
      responseHelper.serverError(res, error);
    }
  }
}

module.exports = AuthController;
