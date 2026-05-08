const Joi = require("joi");

exports.preferensiInvestorValidation = (data) => {
  try {
    const schema = Joi.object({
      kepuasan_pelanggan: Joi.number().min(1).max(5).required(),
      digital_adoption_score: Joi.number().min(1).max(10).required(),
      net_profit_margin: Joi.number().min(-35).max(100).required(),
      year_revenue: Joi.number()
        .integer()
        .min(18_000_000)
        .max(50_000_000_000)
        .required(),
      business_tenure_years: Joi.number().min(0).max(50).required(),
    });
    return schema.validate(data);
  } catch (error) {
    throw error;
  }
};
