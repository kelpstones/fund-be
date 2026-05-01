const PreferensiInvestor = require("../models/preferensi_investor");
const { ResponseHelper } = require("../utils/index");
const {
  validatePreferensiInvestor,
} = require("../validations/preferensi_investor");

const upsertPreferensi = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { error, value } = validatePreferensiInvestor(req.body);
    if (error) return ResponseHelper.error(res, 400, error.details[0].message);

    const data = await PreferensiInvestor.upsertPreferensi(id_user, value);
    return ResponseHelper.success(
      res,
      200,
      "Preferensi berhasil disimpan",
      data,
    );
  } catch (error) {
    return ResponseHelper.error(res, 500, error.message);
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
    return ResponseHelper.error(res, 500, error.message);
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
    return ResponseHelper.error(res, 500, error.message);
  }
};

module.exports = { upsertPreferensi, getPreferensi, deletePreferensi };
