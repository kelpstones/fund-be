const Joi = require("joi");

exports.investasiValidation = (data) => {
  try {
    const schema = Joi.object({
      nominal_investasi: Joi.number().integer().required(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
