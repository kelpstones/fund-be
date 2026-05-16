const responseHelper = require("../utils/response");
const BisnisProfiles = require("../models/bisnis_profiles");
const Bisnis = require("../models/bisnis");
const { BisnisProfileValidator } = require("../validation");
const logger = require("../utils/index").logger;
const axios = require("axios");
class BisnisProfileController {
  async upsertProfile(req, res) {
    try {
      const { id: bisnis_id } = req.params;
      const {
        net_profit_margin,
        kepuasan_pelanggan,
        peak_hour_latency,
        review_volatility,
        repeat_order_rate,
        digital_adoption_score,
        year_revenue,
        business_tenure_years,
      } = req.body;

      // Validasi input
      const { error } = BisnisProfileValidator.bisnisProfileValidation({
        net_profit_margin,
        kepuasan_pelanggan,
        peak_hour_latency,
        review_volatility,
        repeat_order_rate,
        digital_adoption_score,
        year_revenue,
        business_tenure_years,
      });
      if (error) {
        return responseHelper.error(res, error.details[0].message, 400);
      }

      // Cek bisnis exists
      const bisnis = await Bisnis.getBisnisById(bisnis_id);
      if (!bisnis) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }

      // Cek ownership
      if (
        req.user.role_name === "umkm" &&
        bisnis.pemilik.id !== req.user.id
      ) {
        return responseHelper.forbidden(res, "Unauthorized");
      }

      const profileData = {
        net_profit_margin,
        kepuasan_pelanggan,
        peak_hour_latency,
        review_volatility,
        repeat_order_rate,
        digital_adoption_score,
        year_revenue,
        business_tenure_years,
      };

      await BisnisProfiles.upsertProfile(bisnis_id, profileData);

      let finalProfile;
      try {
        const modelUrl = process.env.ML_MODEL_URL;
        const mlResponse = await axios.post(
          `${modelUrl}/classify-umkm`,
          profileData,
        );

        logger.info("ML model response received for classification", {
          responseData: mlResponse.data,
          status: mlResponse.status,
          predicted_class: mlResponse.data.predicted_class_label,
        });

        finalProfile = await BisnisProfiles.updateClass(
          bisnis_id,
          mlResponse.data.predicted_class_id,
        );
      } catch (mlError) {
        logger.error(
          "ML model call failed, returning profile without class update",
          {
            bisnis_id,
            error: mlError,
          },
        );

        finalProfile = await BisnisProfiles.getProfileByBisnisId(bisnis_id);
      }

      return responseHelper.success(
        res,
        "Bisnis profile saved successfully",
        finalProfile,
      );
    } catch (error) {
      logger.error("An error occurred while saving bisnis profile", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async getAllProfilesForML(req, res) {
    try {
      const profiles = await BisnisProfiles.getAll();
      logger.info("Fetched bisnis profiles for ML", { count: profiles.length });
      return responseHelper.success(
        res,
        "Bisnis profiles fetched successfully",
        profiles,
      );
    } catch (error) {
      logger.error("An error occurred while fetching bisnis profiles", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis profiles",
      );
    }
  }

  async getProfile(req, res) {
    try {
      const { id: bisnis_id } = req.params;

      const profile = await BisnisProfiles.getProfileByBisnisId(bisnis_id);
      if (!profile) {
        return responseHelper.error(res, "Bisnis profile not found", 404);
      }

      return responseHelper.success(
        res,
        "Bisnis profile fetched successfully",
        profile,
      );
    } catch (error) {
      logger.error("An error occurred while fetching bisnis profile", {
        error,
      });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis profile",
      );
    }
  }

  
}

module.exports = BisnisProfileController;
