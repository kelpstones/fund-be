const responseHelper = require("../utils/response");

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return responseHelper.unauthorized(res, "Missing API Key");
  }

  if (apiKey !== process.env.API_KEY) {
    return responseHelper.forbidden(res, "Invalid API Key");
  }

  next();
};

module.exports = validateApiKey;
