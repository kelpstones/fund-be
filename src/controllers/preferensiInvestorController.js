const PreferensiInvestor = require("../models/preferensi_investor");
const { ResponseHelper } = require("../utils/index");
const {
  validatePreferensiInvestor,
} = require("../validations/preferensi_investor");
const logger = require("../utils/index").logger;
const upsertPreferensi = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { error, value } = validatePreferensiInvestor(req.body);
    if (error) {
      logger.error("Validation error while upserting preferensi", { error: error.details[0].message });
      return ResponseHelper.error(res, error.details[0].message, 400);
    }

    const data = await PreferensiInvestor.upsertPreferensi(id_user, value);
    return ResponseHelper.success(
      res,
      200,
      "Preferensi berhasil disimpan",
      data,
    );
  } catch (error) {
    logger.error("An error occurred while upserting preferensi", { error });
    return ResponseHelper.error(res, "An error occurred while upserting preferensi", 500);
  }
};

const getPreferensi = async (req, res) => {
  try {
    const id_user = req.user.id;

    const data = await PreferensiInvestor.getByUserId(id_user);
    if (!data) return ResponseHelper.error(res, 404, "Preferensi belum diisi");

    return ResponseHelper.success(
      res,
      200,
      "Berhasil mendapatkan preferensi",
      data,
    );
  } catch (error) {
    logger.error("An error occurred while fetching preferensi", { error });
    return ResponseHelper.error(res, "An error occurred while fetching preferensi", 500);
  }
};

const deletePreferensi = async (req, res) => {
  try {
    const id_user = req.user.id;

    const existing = await PreferensiInvestor.getByUserId(id_user);
    if (!existing)
      return ResponseHelper.error(res, 404, "Preferensi tidak ditemukan");

    await PreferensiInvestor.deleteByUserId(id_user);
    return ResponseHelper.success(res, 200, "Preferensi berhasil dihapus");
  } catch (error) {
    logger.error("An error occurred while deleting preferensi", { error });
    return ResponseHelper.error(res, "An error occurred while deleting preferensi", 500);
  }
};

module.exports = { upsertPreferensi, getPreferensi, deletePreferensi };
