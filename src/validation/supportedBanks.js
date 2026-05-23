const Joi = require("joi");

exports.supportedBankValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().min(2).max(50).uppercase().required().messages({
      "string.base": "Kode bank harus berupa teks",
      "string.empty": "Kode bank tidak boleh kosong",
      "any.required": "Kode bank wajib diisi",
    }),
    name: Joi.string().min(2).max(100).required().messages({
      "string.base": "Nama bank harus berupa teks",
      "string.empty": "Nama bank tidak boleh kosong",
      "any.required": "Nama bank wajib diisi",
    }),
    type: Joi.string().valid("bank", "ewallet").required().messages({
      "any.only": "Tipe harus berupa bank atau ewallet",
      "any.required": "Tipe wajib diisi",
    }),
    is_active: Joi.boolean().optional(),
    logo_url: Joi.string().uri().allow(null, "").optional().messages({
      "string.uri": "Logo URL harus berupa format URI/URL yang valid",
    }),
  });
  return schema.validate(data);
};

exports.supportedBankUpdateValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().min(2).max(50).uppercase().optional().messages({
      "string.base": "Kode bank harus berupa teks",
    }),
    name: Joi.string().min(2).max(100).optional().messages({
      "string.base": "Nama bank harus berupa teks",
    }),
    type: Joi.string().valid("bank", "ewallet").optional().messages({
      "any.only": "Tipe harus berupa bank atau ewallet",
    }),
    is_active: Joi.boolean().optional(),
    logo_url: Joi.string().uri().allow(null, "").optional().messages({
      "string.uri": "Logo URL harus berupa format URI/URL yang valid",
    }),
  });
  return schema.validate(data);
};
