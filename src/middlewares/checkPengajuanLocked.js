const db = require("../config/db");
const response = require("../utils/index").ResponseHelper;
const logger = require("../utils/index");
const checkPengajuanLocked = async (req, res, next) => {
  const pengajuan_id =
    req.params.id ?? req.params.pengajuan_id ?? req.body.pengajuans_id;

  const pengajuan = await db("pengajuans").where({ id: pengajuan_id }).first();

  if (!pengajuan) return response.error(res, "Pengajuan not found", 404);
  logger.logger.info("Checking pengajuan lock status", {
    pengajuan_id,
    status: pengajuan.status,
    locked_by_investor_id: pengajuan.locked_by_investor_id,
    current_user_id: req.user.id,
  });
  if (
    pengajuan.locked_by_investor_id !== null &&
    pengajuan.locked_by_investor_id !== req.user.id
  ) {
    return response.error(res, "Pengajuan is locked by another investor", 403);
  }
//   logger.logger.info('checkPengajuanLocked passed, calling next()');
  req.pengajuan = pengajuan;
  next();
};

module.exports = checkPengajuanLocked;
