const Joi = require("joi");
const pengajuans = require("../models/pengajuans");
const { logger } = require("../utils");
const bisnis = require("../models/bisnis");

exports.pengajuanValidation = (data) => {
  try {
    const schema = Joi.object({
      bisnis_id: Joi.number().integer().required(),
      target_pendanaan: Joi.number().integer().required(),
      per_anual_return: Joi.number().integer().max(50).required().messages({
        "number.max": "Porsi bagi hasil tidak boleh melebihi 50%",
      }),
      deskripsi_peluang: Joi.string().optional(),
      rencana_penggunaan_dana: Joi.array()
        .items(
          Joi.object({
            kategori: Joi.string().required(),
            jumlah: Joi.number().integer().required(),
          }),
        )
        .optional(),
    });
    return schema.validate(data);
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    throw error;
  }
};

exports.checkBisnisNotVerified = async (bisnis_id) => {
  try {
    const bisnisExist = await bisnis.getBisnisByIdForInvestor(bisnis_id);
    if (!bisnisExist) {
      return {
        status: false,
        message: "Bisnis not found or not verified.",
        code: 403,
        data: null,
      };
    }
    return { status: true };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

exports.updatePengajuanValidation = (data) => {
  try {
    const schema = Joi.object({
      target_pendanaan: Joi.number().integer().optional(),
      per_anual_return: Joi.number().integer().max(50).optional().messages({
        "number.max": "Porsi bagi hasil tidak boleh melebihi 50%",
      }),
      total_pendanaan: Joi.number().integer().optional(),
      status: Joi.string()
        .valid("draft", "published", "negotiating", "waiting_payment", "funded", "rejected")
        .optional(),
      deskripsi_peluang: Joi.string().optional(),
      rencana_penggunaan_dana: Joi.array()
        .items(
          Joi.object({
            kategori: Joi.string().required(),
            jumlah: Joi.number().integer().required(),
          }),
        )
        .optional(),
    });
    return schema.validate(data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
