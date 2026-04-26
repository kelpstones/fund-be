const Joi = require("joi");

exports.registerValidation = (data) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      password_confirmation: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Password confirmation does not match password",
        }),
      nik: Joi.string().min(16).max(16).required(),
      no_telp: Joi.string().min(10).max(15).required(),
      role_id: Joi.number().integer().required(),
    });

    const validate = schema.validate(data);
    if (validate.error) {
      return {
        status: false,
        message: validate.error.details[0].message,
        code: 400,
        data: null,
      };
    }
    return { status: true };
  } catch (error) {
    throw error;
  }
};

exports.loginValidation = (data) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
    const validate = schema.validate(data);
    if (validate.error) {
      return {
        status: false,
        message: validate.error.details[0].message,
        code: 400,
        data: null,
      };
    }
    return { status: true };
  } catch (error) {
    throw error;
  }
};
