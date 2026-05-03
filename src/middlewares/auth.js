const jwt = require("jsonwebtoken");
const responseHelper = require("../utils/index").ResponseHelper;
const logger = require("../utils/index").logger;
exports.verifyAnyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    logger.warn("No token provided", {
      ip: req.ip,
      method: req.method,
    });
    return responseHelper.unauthorized(res, "No token provided");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser;
      return next();
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_ADMIN,
      (errAdmin, decodedAdmin) => {
        if (errAdmin) {
          logger.warn("Invalid or expired token", {
            ip: req.ip,
            method: req.method,
          });
          return responseHelper.unauthorized(res, "Invalid or expired token");
        }
        req.admin = decodedAdmin;
        next();
      },
    );
  });
};
