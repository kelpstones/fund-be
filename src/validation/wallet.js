const Joi = require("joi");

exports.topUpValidation = (data) => {
  const schema = Joi.object({
    jumlah: Joi.number().positive().min(10000).required().messages({
      "number.base": "Jumlah harus berupa angka",
      "number.positive": "Jumlah harus bernilai positif",
      "number.min": "Minimal pengisian saldo adalah Rp 10.000",
      "any.required": "Jumlah wajib diisi",
    }),
  });
  return schema.validate(data);
};

exports.withdrawValidation = (data) => {
  const schema = Joi.object({
    jumlah: Joi.number().positive().min(50000).required().messages({
      "number.base": "Jumlah harus berupa angka",
      "number.positive": "Jumlah harus bernilai positif",
      "number.min": "Minimal penarikan dana adalah Rp 50.000",
      "any.required": "Jumlah wajib diisi",
    }),
    user_bank_account_id: Joi.number().integer().positive().optional().messages({
      "number.base": "ID rekening bank harus berupa angka",
    }),
  });
  return schema.validate(data);
};

exports.updateWithdrawalStatusValidation = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid("completed", "failed").required().messages({
      "any.only": "Status harus berupa completed atau failed",
      "any.required": "Status wajib diisi",
    }),
    alasan: Joi.string().optional(),
  });
  return schema.validate(data);
};

