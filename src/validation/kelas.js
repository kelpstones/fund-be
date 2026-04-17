const Joi = require("joi");

exports.kelasValidation = (data) => {
  try {
    const schema = Joi.object({
      nama_kelas: Joi.string().required(),
      deskripsi: Joi.string().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
