const Joi = require("joi");

exports.userUpdateValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().min(3).max(30).optional(),
      email: Joi.string().email().optional(),
      no_telp: Joi.string().min(10).max(15).optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
