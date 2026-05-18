const responseHelper = require("../utils/index").ResponseHelper;
const logger = require("../utils/index").logger;
const DokumenBisnis = require("../models/dokumen_bisnis");
const Bisnis = require("../models/bisnis");
const { cloudinary } = require("../config/cloudinary");
const { CloudinaryUtils } = require("../utils/index");

const NAMA_DOKUMEN_MAP = {
  legalitas_usaha: {
    wajib: ["KTP Pemilik", "NIB"],
    opsional: ["NPWP", "Akta Pendirian", "SIUP"],
  },
  proposal_pendanaan: {
    wajib: [],
    opsional: ["Proposal Bisnis", "Rencana Penggunaan Dana", "Pitch Deck"],
  },
  laporan_penjualan: {
    wajib: [
      "Laporan Keuangan",
      "Laporan Omset Bulanan",
      "Laporan Omset Tahunan",
    ],
    opsional: [],
  },
};

class DokumenBisnisController {
  // UMKM: Upload / re-upload dokumen
  async uploadDokumen(req, res) {
    try {
      const { jenis_dokumen } = req.body;
      let nama_list = req.body.nama_list;

      // 1. validasi jenis_dokumen dulu
      const validJenis = [
        "legalitas_usaha",
        "proposal_pendanaan",
        "laporan_penjualan",
      ];
      if (!validJenis.includes(jenis_dokumen))
        return responseHelper.error(res, "Jenis dokumen tidak valid", 400);

      // 2. parse nama_list dulu SEBELUM validasi isi
      if (typeof nama_list === "string") {
        try {
          nama_list = JSON.parse(nama_list);
        } catch {
          nama_list = [nama_list];
        }
      }

      // 3. cek bisnis & files
      const bisnis = await Bisnis.getBisnisByUserId(req.user.id);
      if (!bisnis)
        return responseHelper.error(res, "Bisnis tidak ditemukan", 404);
      if (!req.files || req.files.length === 0)
        return responseHelper.error(res, "File wajib diupload", 400);

      // 4. cek jumlah
      if (!nama_list || nama_list.length !== req.files.length)
        return responseHelper.error(
          res,
          "Jumlah nama_list harus sama dengan jumlah file",
          400,
        );

      // 5. baru validasi nama
      const docMap = NAMA_DOKUMEN_MAP[jenis_dokumen];
      const allValid = [...docMap.wajib, ...docMap.opsional];
      const invalidNama = nama_list.filter((n) => !allValid.includes(n));
      if (invalidNama.length > 0) {
        return responseHelper.error(
          res,
          `Nama dokumen tidak valid: ${invalidNama.join(", ")}`,
          400,
          {
            valid_options: allValid,
          },
        );
      }

      // 6. cek duplikat
      if (nama_list.length !== new Set(nama_list).size)
        return responseHelper.error(
          res,
          "Nama dokumen tidak boleh duplikat",
          400,
        );

      // 7. upload & insert
      const results = await Promise.all(
        req.files.map(async (file, i) => {
          const result = await CloudinaryUtils.uploadToCloudinary(
            file.buffer,
            `fundraise/dokumen-bisnis/${bisnis.id}-${jenis_dokumen}`,
            "auto",
          );
          return DokumenBisnis.insert(
            bisnis.id,
            jenis_dokumen,
            nama_list[i],
            result.secure_url,
          );
        }),
      );

      return responseHelper.created(res, "Dokumen berhasil diupload", results);
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
