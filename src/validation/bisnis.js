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



