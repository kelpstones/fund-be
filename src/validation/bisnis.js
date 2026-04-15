const Joi = require("joi");
const { decodeToken } = require("../utils/jwt");
const Role = require("../models/roles");
const responseHelper = require("../utils/response");
exports.bisnisValidation = (data) => {
  try {
    // console.log(data);
    const schema = Joi.object({
      nama: Joi.string().required(),
      alamat: Joi.string().required(),
      no_telp: Joi.string().optional(),
      email: Joi.string().email().required(),
      deskripsi: Joi.string().required(),
      user_id: Joi.number().integer().required(),
      kelas_id: Joi.number().integer().required(),
    });

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.bisnisUpdateValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().optional(),
      alamat: Joi.string().optional(),
      no_telp: Joi.string().optional(),
      email: Joi.string().email().optional(),
      deskripsi: Joi.string().optional(),
      kelas_id: Joi.number().integer().optional(),
    });

    

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.bisnisTokenValidation = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return responseHelper.error(res, "Pengguna tidak terautentikasi", 401);
    }

    const schema = Joi.object({
      id: Joi.number().integer().required(),
      email: Joi.string().email().required(),
      role_id: Joi.number().integer().required(),
      iat: Joi.number(),
      exp: Joi.number(),
    });

    const { error } = schema.validate(user);
    if (error) {
      return responseHelper.error(res, "Struktur token tidak valid", 400);
    }

    Role.getRoleById(user.role_id)
      .then((role) => {
        if (!role || role.nama !== "umkm") {
          return responseHelper.error(
            res,
            "Akses ditolak: hanya pengguna dengan peran UMKM yang dapat mengakses sumber daya ini",
            403,
          );
        }
        next();
      })
      .catch((err) => {
        console.error(err);
        return responseHelper.serverError(
          res,
          "An error occurred while validating token",
        );
      });
  } catch (error) {
    console.error(error);
    return responseHelper.serverError(
      res,
      "An error occurred while validating token",
    );
  }
};

