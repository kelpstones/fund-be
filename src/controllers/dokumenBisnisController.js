const responseHelper = require("../utils/index").ResponseHelper;
const logger = require("../utils/index").logger;
const DokumenBisnis = require("../models/dokumen_bisnis");
const Bisnis = require("../models/bisnis");
const { cloudinary } = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "fundraise/dokumen-bisnis", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (file_url) => {
  if (!file_url) return;
  const parts = file_url.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  await cloudinary.uploader.destroy(`fundraise/dokumen-bisnis/${filename}`);
};

class DokumenBisnisController {
  // UMKM: Upload / re-upload dokumen
  async uploadDokumen(req, res) {
    try {
      const { jenis_dokumen } = req.body;
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id);

      if (!bisnis) {
        return responseHelper.error(res, "Bisnis tidak ditemukan", 404);
      }

      if (!req.file) {
        return responseHelper.error(res, "File wajib diupload", 400);
      }

      const validJenis = [
        "legalitas_usaha",
        "proposal_pendanaan",
        "laporan_penjualan",
      ];
      if (!validJenis.includes(jenis_dokumen)) {
        return responseHelper.error(res, "Jenis dokumen tidak valid", 400);
      }

      const existing = await DokumenBisnis.getByBisnisIdAndJenis(
        bisnis.id,
        jenis_dokumen,
      );

      const result = await uploadToCloudinary(req.file.buffer);

      if (existing) {
        await deleteFromCloudinary(existing.file_url);
        await DokumenBisnis.update(existing.id, {
          file_url: result.secure_url,
          status: "pending",
          catatan: null,
        });
        return responseHelper.success(res, "Dokumen berhasil diperbarui", null);
      }

      const dokumen = await DokumenBisnis.insert(
        bisnis.id,
        jenis_dokumen,
        result.secure_url,
      );
      return responseHelper.created(res, "Dokumen berhasil diupload", dokumen);
    } catch (error) {
      logger.error("Error uploading dokumen bisnis", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while uploading dokumen",
      );
    }
  }

  // UMKM: Lihat semua dokumen + kelengkapan
  async getDokumenSaya(req, res) {
    try {
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id);
      if (!bisnis) {
        return responseHelper.error(res, "Bisnis tidak ditemukan", 404);
      }

      const [dokumen, kelengkapan] = await Promise.all([
        DokumenBisnis.getByBisnisId(bisnis.id),
        DokumenBisnis.getKelengkapan(bisnis.id),
      ]);

      return responseHelper.success(res, "Dokumen fetched successfully", {
        dokumen,
        kelengkapan,
      });
    } catch (error) {
      logger.error("Error fetching dokumen bisnis", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching dokumen",
      );
    }
  }

  // ADMIN: List semua dokumen pending
  async getDokumenPending(req, res) {
    try {
      const dokumen = await DokumenBisnis.getPending();
      return responseHelper.success(
        res,
        "Pending dokumen fetched successfully",
        { dokumen },
      );
    } catch (error) {
      logger.error("Error fetching pending dokumen", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching pending dokumen",
      );
    }
  }

  async reviewDokumen(req, res) {
    try {
      const { id } = req.params;
      const { status, catatan } = req.body;

      if (!["valid", "invalid"].includes(status)) {
        return responseHelper.error(
          res,
          "Status harus valid atau invalid",
          400,
        );
      }

      if (status === "invalid" && !catatan) {
        return responseHelper.error(
          res,
          "Catatan wajib diisi jika invalid",
          400,
        );
      }

      const dokumen = await DokumenBisnis.getById(id);
      if (!dokumen) {
        return responseHelper.error(res, "Dokumen tidak ditemukan", 404);
      }

      if (dokumen.status !== "pending") {
        return responseHelper.error(
          res,
          "Hanya dokumen berstatus pending yang bisa direview",
          400,
        );
      }

      await DokumenBisnis.update(id, { status, catatan: catatan || null });

      const message =
        status === "valid"
          ? "Dokumen berhasil divalidasi"
          : "Dokumen berhasil ditolak";
      return responseHelper.success(res, message, null);
    } catch (error) {
      logger.error("Error reviewing dokumen bisnis", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while reviewing dokumen",
      );
    }
  }

  // ADMIN: Verifikasi bisnis setelah semua dokumen valid
  async verifikasiBisnis(req, res) {
    try {
      const { bisnis_id } = req.params;

      const bisnis = await Bisnis.getBisnisById(bisnis_id);
      if (!bisnis) {
        return responseHelper.error(res, "Bisnis tidak ditemukan", 404);
      }

      const { isValid, belumValid } = await DokumenBisnis.isAllValid(bisnis_id);
      if (!isValid) {
        return responseHelper.error(
          res,
          "Belum semua dokumen wajib valid",
          400,
          { belum_valid: belumValid },
        );
      }

      await Bisnis.updateVerifikasi(bisnis_id);

      return responseHelper.success(res, "Bisnis berhasil diverifikasi", null);
    } catch (error) {
      logger.error("Error verifikasi bisnis", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while verifying bisnis",
      );
    }
  }
}

module.exports = DokumenBisnisController;
