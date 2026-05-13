const responseHelper = require("../utils/response");
const preferensiInvestorModel = require("../models/preferensi_investor");
const personalisasi = require("../models/personalisasi");
const User = require("../models/users");
const axios = require("axios");
const logger = require("../utils/index").logger;
const { PreferensiInvestorValidator } = require("../validation/index");
class PreferensiInvestorController {
  async submitPreferensi(req, res) {
    try {
      const investor_id = req.user.id;
      const {
        kepuasan_pelanggan,
        digital_adoption_score,
        net_profit_margin,
        year_revenue,
        business_tenure_years,
      } = req.body;

      // Validasi field wajib
      const { error } =
        PreferensiInvestorValidator.preferensiInvestorValidation({
          kepuasan_pelanggan,
          digital_adoption_score,
          net_profit_margin,
          year_revenue,
          business_tenure_years,
        });
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const savedPreferensi = await preferensiInvestorModel.upsert(
        investor_id,
        {
          kepuasan_pelanggan,
          digital_adoption_score,
          net_profit_margin,
          year_revenue,
          business_tenure_years,
        },
      );

      await User.updateUser(investor_id, { is_onboarded: 1 });

      const modelUrl = process.env.ML_MODEL_URL;
      let rekomendasi = [];

      try {
        const modelResponse = await axios.post(`${modelUrl}/recommend`, {
          investor_id,
          kepuasan_pelanggan,
          digital_adoption_score,
          net_profit_margin,
          year_revenue,
          business_tenure_years,
        });

        logger.info("ML model response received", {
          investor_id,
          status: modelResponse.status,
        });
        const results = modelResponse.data.results ?? [];
        logger.info("ML model returned results", {
          investor_id,
          resultCount: results.length,
        });
        if (results.length > 0) {
          rekomendasi = await personalisasi.upsertBatch(investor_id, results);
        }
      } catch (modelErr) {
        logger.error("ML model tidak dapat dijangkau saat onboarding", {
          error: modelErr.message,
          investor_id,
        });
      }

      return responseHelper.success(
        res,
        "Survey berhasil, rekomendasi UMKM siap",
        {
          preferensi: savedPreferensi,
          rekomendasi,
        },
      );
    } catch (error) {
      logger.error("Error submitPreferensi", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async getPreferensi(req, res) {
    try {
      const investor_id = req.user.id;
      const data = await preferensiInvestorModel.getByInvestorId(investor_id);
      if (!data)
        return responseHelper.error(res, "Preferensi belum diisi", 404);
      return responseHelper.success(res, "Preferensi investor", data);
    } catch (error) {
      logger.error("Error getPreferensi", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async getRekomendasi(req, res) {
    try {
      const investor_id = req.user.id;

      const prefData =
        await preferensiInvestorModel.getByInvestorId(investor_id);
      if (!prefData) {
        return responseHelper.error(
          res,
          "Silakan lengkapi preferensi terlebih dahulu",
          400,
        );
      }

      const data = await personalisasi.getByUserId(investor_id);

      if (data.length === 0) {
        return responseHelper.success(
          res,
          "Belum ada rekomendasi, coba refresh",
          [],
        );
      }

      return responseHelper.success(res, "Rekomendasi UMKM untuk kamu", {
        investor_id,
        total: data.length,
        rekomendasi: data,
      });
    } catch (error) {
      logger.error("Error getRekomendasi", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async refreshRekomendasi(req, res) {
    try {
      const investor_id = req.user.id;

      const prefData =
        await preferensiInvestorModel.getByInvestorId(investor_id);
      if (!prefData) {
        return responseHelper.error(
          res,
          "Silakan lengkapi preferensi terlebih dahulu",
          400,
        );
      }

      const modelUrl = process.env.ML_MODEL_URL;

      let modelResponse;
      try {
        modelResponse = await axios.post(
          `${modelUrl}/recommend`,
          {
            investor_id,
            kepuasan_pelanggan: prefData.kepuasan_pelanggan,
            digital_adoption_score: prefData.digital_adoption_score,
            net_profit_margin: prefData.net_profit_margin,
            year_revenue: prefData.year_revenue,
            business_tenure_years: prefData.business_tenure_years,
          },
          {
            timeout: 10000,
          },
        );

        logger.info("ML model response received on refresh", {
          investor_id,
          status: modelResponse.status,
        });
      } catch (modelErr) {
        if (modelErr.code === "ECONNREFUSED" || modelErr.code === "ENOTFOUND") {
          logger.error("ML model tidak dapat dijangkau", {
            error: modelErr,
            investor_id,
          });
          return responseHelper.error(
            res,
            "Layanan rekomendasi sedang tidak tersedia, coba beberapa saat lagi",
            503,
          );
        }

        // Model timeout
        if (
          modelErr.code === "ECONNABORTED" ||
          modelErr.message?.includes("timeout")
        ) {
          logger.error("ML model timeout", {
            error: modelErr.message,
            investor_id,
          });
          return responseHelper.error(
            res,
            "Layanan rekomendasi membutuhkan waktu terlalu lama, coba beberapa saat lagi",
            504,
          );
        }

        // Model return error (4xx / 5xx dari sisi model)
        if (modelErr.response) {
          logger.error("ML model return error", {
            status: modelErr.response.status,
            data: modelErr.response.data,
            investor_id,
          });
          return responseHelper.error(
            res,
            "Layanan rekomendasi mengalami masalah internal",
            502,
          );
        }

        // Error lain yang tidak dikenal
        logger.error("ML model unknown error", {
          error: modelErr.message,
          investor_id,
        });
        return responseHelper.error(
          res,
          "Gagal menghubungi layanan rekomendasi",
          502,
        );
      }

      const results = modelResponse.data.results ?? [];
      const saved = await personalisasi.upsertBatch(investor_id, results);

      return responseHelper.success(
        res,
        "Rekomendasi berhasil diperbarui",
        saved,
      );
    } catch (error) {
      logger.error("Error refreshRekomendasi", { error });
      return responseHelper.serverError(res, error);
    }
  }
}

module.exports = PreferensiInvestorController;
