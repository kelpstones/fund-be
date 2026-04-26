const Joi = require("joi");

exports.bisnisProfileValidation = (data) => {
  // console.log("Validating bisnis profile data:", data);
  const schema = Joi.object({
    net_profit_margin: Joi.number().required().messages({
      "any.required": "net_profit_margin wajib diisi",
    }),
    kepuasan_pelanggan: Joi.number()
      .min(1.0)
      .max(5.0)
      .precision(1)
      .required()
      .messages({
        "number.min": "kepuasan_pelanggan minimal 1.0",
        "number.max": "kepuasan_pelanggan maksimal 5.0",
        "any.required": "kepuasan_pelanggan wajib diisi",
      }),
    peak_hour_latency: Joi.string()
      .valid("low", "medium", "high")
      .required()
      .messages({
        "any.only": "peak_hour_latency harus: low, medium, atau high",
        "any.required": "peak_hour_latency wajib diisi",
      }),
    review_volatility: Joi.number().min(0).required().messages({
      "number.min": "review_volatility tidak boleh negatif",
      "any.required": "review_volatility wajib diisi",
    }),
    repeat_order_rate: Joi.number().min(0).max(100).required().messages({
      "number.min": "repeat_order_rate minimal 0",
      "number.max": "repeat_order_rate maksimal 100",
      "any.required": "repeat_order_rate wajib diisi",
    }),
    digital_adoption_score: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        "number.min": "digital_adoption_score minimal 1",
        "number.max": "digital_adoption_score maksimal 10",
        "any.required": "digital_adoption_score wajib diisi",
      }),
    year_revenue: Joi.number().min(0).required().messages({
      "number.min": "year_revenue tidak boleh negatif",
      "any.required": "year_revenue wajib diisi",
    }),
    business_tenure_years: Joi.number().min(0).required().messages({
      "number.min": "business_tenure_years tidak boleh negatif",
      "any.required": "business_tenure_years wajib diisi",
    }),
  });

  return schema.validate(data);
};
