const rateLimit = require("express-rate-limit");
const logger = require("../utils/index").logger;
const responseHelper = require("../utils/index").ResponseHelper;
class RateLimiter {
  static genRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.LIMITTER || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn("rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      });
      responseHelper.error(
        res,
        "Too many requests from this IP, please try again after 15 minutes",
        429,
      );
    },
  });

  static authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: process.env.AUTH_LIMITTER || 10,
    handler: (req, res) => {
      logger.warn("auth rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        email: req.body?.email,
      });
      responseHelper.error(
        res,
        "Too many authentication attempts from this IP, please try again after 15 minutes",
        429,
      );
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  static emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: process.env.EMAIL_LIMITTER || 5,
    handler: (req, res) => {
      logger.warn("email rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      });
      responseHelper.error(
        res,
        "Too many email requests from this IP, please try again after an hour",
        429,
      );
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = RateLimiter;
