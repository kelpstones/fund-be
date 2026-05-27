const { ResponseHelper } = require("../utils/index");
const logger = require("../utils/index").logger;

const blockedPatterns = [
  /\.php$/i,
  /\.env$/i,
  /\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /phpunit/i,
  /\.cgi$/i,
];

const blockScanners = (req, res, next) => {
  const isSuspicious = blockedPatterns.some((pattern) =>
    pattern.test(req.path),
  );
  if (isSuspicious) {
    logger.warn(
      `Suspicious scanner blocked: ${req.method} ${req.originalUrl} from IP ${req.ip}`,
    );
    return ResponseHelper.forbidden(res, "Access forbidden");
  }
  next();
};

module.exports = {
  blockScanners,
};
