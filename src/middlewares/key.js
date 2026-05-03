const responseHelper = require("../utils/index").ResponseHelper;
const logger = require("../utils/index").logger;
exports.validateApiKey = (req, res, next) => {
  const ourKey = process.env.API_KEY;
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    logger.warn("Missing API Key", {
      ip: req.ip,
      method: req.method,
    });
    return responseHelper.unauthorized(res, "Missing API Key");
  }

  if (apiKey !== ourKey) {
    logger.warn("Invalid API Key", {
      ip: req.ip,
      method: req.method,
    });
    return responseHelper.forbidden(res, "Invalid API Key");
  }

  next();
};
