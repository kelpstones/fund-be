const Joi = require("joi");

exports.negotiationValidation = (data) => {
  try {
    const schema = Joi.object({
      pengajuans_id: Joi.number().integer().required(),
      penawaran_return: Joi.number().positive().max(50).precision(2).required().messages({
        "number.max": "Porsi bagi hasil tidak boleh melebihi 50%",
      }),
      penawaran_nominal: Joi.number().positive().precision(2).required(),

      catatan: Joi.string().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.replyNegotiationValidation = (data) => {
  try {
    const schema = Joi.object({
      penawaran_return: Joi.number().positive().max(50).precision(2).required().messages({
        "number.max": "Porsi bagi hasil tidak boleh melebihi 50%",
      }),
      penawaran_nominal: Joi.number().positive().precision(2).required(),
      catatan: Joi.string().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.acceptRejectNegotiationValidation = (data) => {
  try {
    const schema = Joi.object({
      catatan: Joi.string().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
