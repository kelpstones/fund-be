const Joi = require("joi");
const { decodeToken } = require("../utils/jwt");
const Role = require("../models/roles");
exports.bisnisValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().required(),
      alamat: Joi.string().required(),
      no_telp: Joi.string().required(),
      email: Joi.string().email().required(),
      deskripsi: Joi.string().required(),
    });

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.bisnisTokenValidation = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    const schema = Joi.object({
      id: Joi.number().integer().required(),
      email: Joi.string().email().required(),
      role_id: Joi.number().integer().required(),
    });
    const { error } = schema.validate(decoded);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    Role.getRoleById(decoded.role_id)
      .then((role) => {
        if (!role || role.name !== "umkm") {
          return res.status(403).json({ message: "Unauthorized" });
        }
        req.user = decoded;
        next();
      })
      .catch((err) => {
        return res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
