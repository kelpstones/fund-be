const jwt = require("jsonwebtoken");
const responseHelper = require("../utils/response");

exports.verifyAnyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return responseHelper.unauthorized(res, "No token provided");

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser;
      return next();
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_ADMIN,
      (errAdmin, decodedAdmin) => {
        if (errAdmin)
          return responseHelper.unauthorized(res, "Invalid or expired token");
        req.admin = decodedAdmin;
        next();
      },
    );
  });
};
