const responseHelper = require("../utils/response");

const validateApiKey = (req, res, next) => {
  const ourKey = process.env.API_KEY;
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return responseHelper.unauthorized(res, "Missing API Key");
  }

  if (apiKey !== ourKey) {
    return responseHelper.forbidden(res, "Invalid API Key");
  }

  next();
};

module.exports = validateApiKey;
