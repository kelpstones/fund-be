const Joi = require("joi");

exports.invoiceValidation = (data) => {
  try {
    const schema = Joi.object({
      id_negosiasi: Joi.number().integer().required(),
      id_pengajuan: Joi.number().integer().required(),
      id_investor: Joi.number().integer().required(),
      nominal_tagihan: Joi.number().positive().precision(2).required(),
      kode_pembayaran: Joi.string().max(100).required(),
      tenggat_waktu: Joi.date().required(),
      status: Joi.string()
        .valid("pending", "paid", "cancelled")
        .default("pending")
        .required(),
    });

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
