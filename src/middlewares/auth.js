const jwt = require("jsonwebtoken");
const responseHelper = require("../utils/response");

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return responseHelper.unauthorized(
      res,
      "No token provided, please login first",
    );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return responseHelper.unauthorized(
      res,
      "Token's invalid or expired, please login again",
    );
  }
};

// admin
exports.verifyAdminToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return responseHelper.unauthorized(
      res,
      "No token provided, please login first",
    );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return responseHelper.unauthorized(
      res,
      "Token's invalid or expired, please login again",
    );
  }
};

