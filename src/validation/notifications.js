const Joi = require("joi");

exports.notificationValidation = (data) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      message: Joi.string().required(),
      type: Joi.string().valid("pengajuan", "pengajuan_status").required(),
      reference_id: Joi.number().integer().optional(),
      pengajuans_id: Joi.number().integer().optional(),
      user_id: Joi.number().integer().optional(),
      admin_id: Joi.number().integer().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
