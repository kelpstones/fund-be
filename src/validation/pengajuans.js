const Joi = require("joi");

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
