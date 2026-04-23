const Joi = require("joi");

exports.penjualanValidation = (data) => {
  try {
    const schema = Joi.object({
      pengajuans_id: Joi.number().integer().required(),
      periode: Joi.string().required(),
      total_penjualan: Joi.number().precision(2).required(),
      laba_bersih: Joi.number().precision(2).required(),
      laba_kotor: Joi.number().precision(2).required(),
      jumlah_transaksi: Joi.number().integer().required(),
    });

    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.penjualanUpdateValidation = (data) => {
  try {
    const schema = Joi.object({
      periode: Joi.string().optional(),
      total_penjualan: Joi.number().precision(2).optional(),
      laba_bersih: Joi.number().precision(2).optional,
      laba_kotor: Joi.number().precision(2).optional(),
      jumlah_transaksi: Joi.number().integer().optional(),
    });
    return schema.validate(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
