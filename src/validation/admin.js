const Joi = require("joi");

exports.adminValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      no_telp: Joi.string().optional(),
      level: Joi.string().valid("superadmin", "admin").required(),
    });
    return schema.validate(data);
  } catch (error) {
    throw error;
  }
};

exports.adminUpdateValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().optional(),
      email: Joi.string().email().optional(),
      no_telp: Joi.string().optional(),
      level: Joi.string().valid("superadmin", "admin").optional(),
    });
    return schema.validate(data);
  } catch (error) {
    throw error;
  }
};
