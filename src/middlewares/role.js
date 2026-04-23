const responseHelper = require("../utils/index").ResponseHelper;

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Gabungkan data dari req.user atau req.admin
    const account = req.user || req.admin;

    if (!account) {
      return responseHelper.unauthorized(res, "Identity not found");
    }

  
    const userRole = account.role_name || account.level;
    // console.log("User Role:", userRole);
    // console.log("Allowed Roles:", allowedRoles);
    if (!allowedRoles.includes(userRole)) {
      return responseHelper.forbidden(
        res,
        "You don't have permission to access this resource",
      );
    }
    next();
  };
};
