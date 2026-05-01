const Joi = require("joi");

exports.requestPasswordResetValidation = (data) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const validate = schema.validate(data);
    return {
      status: !validate.error,
      message: validate.error ? validate.error.details[0].message : null,
      code: validate.error ? 400 : 200,
      data: null,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.resetPasswordValidation = (data) => {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
      new_password: Joi.string().min(6).required(),
      password_confirmation: Joi.string()
        .valid(Joi.ref("new_password"))
        .required(),
    });
    const validate = schema.validate(data);
    return {
      status: !validate.error,
      message: validate.error ? validate.error.details[0].message : null,
      code: validate.error ? 400 : 200,
      data: null,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
