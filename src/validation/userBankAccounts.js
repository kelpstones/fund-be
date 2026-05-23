const Joi = require("joi");

exports.bankAccountValidation = (data) => {
  const schema = Joi.object({
    bank_id: Joi.number().integer().positive().required().messages({
      "number.base": "ID bank harus berupa angka",
      "any.required": "ID bank wajib diisi",
    }),
    bank_account_number: Joi.string().min(5).max(30).required().messages({
      "string.base": "Nomor rekening harus berupa teks",
      "string.empty": "Nomor rekening tidak boleh kosong",
      "any.required": "Nomor rekening wajib diisi",
    }),
    bank_account_holder: Joi.string().min(3).max(100).required().messages({
      "string.base": "Nama pemilik rekening harus berupa teks",
      "string.empty": "Nama pemilik rekening tidak boleh kosong",
      "any.required": "Nama pemilik rekening wajib diisi",
    }),
    is_primary: Joi.boolean().optional(),
  });
  return schema.validate(data);
};
