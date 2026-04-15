const Joi = require("joi");
const pengajuans = require("../models/pengajuans");

exports.pengajuanValidation = (data) => {
  try {
    const schema = Joi.object({
      bisnis_id: Joi.number().integer().required(),
      target_pendanaan: Joi.number().integer().required(),
      per_anual_return: Joi.number().integer().required(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.checkBisnisIdExist = async (bisnis_id) => {
  try {
    const pengajuanExist = await pengajuans.getPengajuanByBisnisId(bisnis_id);
    if (pengajuanExist) {
      return {
        status: false,
        message:
          "Pengajuan for this bisnis already exists. Each bisnis can only have one pengajuan.",
        code: 400,
        data: null,
      };
    }
    return { status: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updatePengajuanValidation = (data) => {
  try {
    const schema = Joi.object({
      target_pendanaan: Joi.number().integer().optional(),
      per_anual_return: Joi.number().integer().optional(),
      total_pendanaan: Joi.number().integer().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
