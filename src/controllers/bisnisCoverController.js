const responseHelper = require('../utils/index').ResponseHelper
const logger = require('../utils/index').logger
const BisnisCover = require('../models/bisnis_covers')
const Bisnis = require('../models/bisnis')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary')

const MAX_COVER = 5

class BisnisCoverController {

  // Upload cover baru
  async uploadCover(req, res) {
    try {
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id)
      if (!bisnis) return responseHelper.error(res, 'Bisnis tidak ditemukan', 404)

      if (!req.file) return responseHelper.error(res, 'File wajib diupload', 400)

      const count = await BisnisCover.countByBisnisId(bisnis.id)
      if (count >= MAX_COVER) {
        return responseHelper.error(res, `Maksimal ${MAX_COVER} foto cover`, 400)
      }

      const result = await uploadToCloudinary(req.file.buffer, 'fund-raise/cover-bisnis', 'image')

      const cover = await BisnisCover.insert(bisnis.id, result.secure_url, count)

      return responseHelper.created(res, 'Cover berhasil diupload', cover)
    } catch (error) {
      logger.error('Error uploading bisnis cover', { error })
      return responseHelper.serverError(res, 'An error occurred while uploading cover')
    }
  }

  // Get semua cover milik bisnis
  async getCovers(req, res) {
    try {
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id)
      if (!bisnis) return responseHelper.error(res, 'Bisnis tidak ditemukan', 404)

      const covers = await BisnisCover.getByBisnisId(bisnis.id)
      return responseHelper.success(res, 'Covers fetched successfully', covers)
    } catch (error) {
      logger.error('Error fetching bisnis covers', { error })
      return responseHelper.serverError(res, 'An error occurred while fetching covers')
    }
  }

  // Hapus cover
  async deleteCover(req, res) {
    try {
      const { id } = req.params
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id)
      if (!bisnis) return responseHelper.error(res, 'Bisnis tidak ditemukan', 404)

      const cover = await BisnisCover.getById(id)
      if (!cover) return responseHelper.error(res, 'Cover tidak ditemukan', 404)

      if (cover.bisnis_id !== bisnis.id) {
        return responseHelper.error(res, 'Unauthorized', 403)
      }

      await deleteFromCloudinary(cover.image_url, 'fund-raise/cover-bisnis')
      await BisnisCover.delete(id)

      return responseHelper.success(res, 'Cover berhasil dihapus', null)
    } catch (error) {
      logger.error('Error deleting bisnis cover', { error })
      return responseHelper.serverError(res, 'An error occurred while deleting cover')
    }
  }

  // Reorder cover (drag & drop)
  async reorderCovers(req, res) {
    try {
      const { orders } = req.body
      // orders = [{ id: 1, urutan: 0 }, { id: 2, urutan: 1 }]

      if (!Array.isArray(orders) || orders.length === 0) {
        return responseHelper.error(res, 'Orders tidak valid', 400)
      }

      const bisnis = await Bisnis.getBisnisByUserId(req.user.id)
      if (!bisnis) return responseHelper.error(res, 'Bisnis tidak ditemukan', 404)

      await BisnisCover.reorder(bisnis.id, orders)

      const covers = await BisnisCover.getByBisnisId(bisnis.id)
      return responseHelper.success(res, 'Cover berhasil direorder', covers)
    } catch (error) {
      logger.error('Error reordering bisnis covers', { error })
      return responseHelper.serverError(res, 'An error occurred while reordering covers')
    }
  }
}

module.exports = BisnisCoverController