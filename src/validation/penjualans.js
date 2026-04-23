const Joi = require("joi");

exports.penjualanValidation = (data) => {
  try {
    const schema = Joi.object({
      pengajuans_id: Joi.number().integer().required(),
      periode: Joi.string().required(),
      total_penjualan: Joi.number().precision(2).required(),
      laba_bersih: Joi.number().precision(2).required(),
      jumlah_transaksi: Joi.number().integer().required(),
    });

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
