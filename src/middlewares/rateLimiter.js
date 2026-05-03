const rateLimit = require("express-rate-limit");

class RateLimiter {
  static genRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: process.env.LIMITTER || 100,
    message: {
      status: "error",
      message:
        "Too many requests from this IP, please try again after 15 minutes",
      code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  static authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: process.env.AUTH_LIMITTER || 10,
    message: {
      status: "error",
      message:
        "Too many authentication attempts from this IP, please try again after 15 minutes",
      code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  static emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: process.env.EMAIL_LIMITTER || 5,
    message: {
      status: "error",
      message:
        "Too many email requests from this IP, please try again after an hour",
      code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = RateLimiter;
