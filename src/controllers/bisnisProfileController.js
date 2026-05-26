const responseHelper = require("../utils/response");
const BisnisProfiles = require("../models/bisnis_profiles");
const Bisnis = require("../models/bisnis");
const { BisnisProfileValidator } = require("../validation");
const logger = require("../utils/index").logger;
const redisClient = require("../utils/index").RedisClient;
const axios = require("axios");
const CACHE_KEY_ALL_PROFILES = "bisnis_profiles:all";
const CACHE_TTL = 60 * 5;

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
      if (req.user.role_name === "umkm" && bisnis.pemilik.id !== req.user.id) {
        return responseHelper.forbidden(
          res,
          "You don't have permission to update this bisnis profile",
        );
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
      await redisClient.del(CACHE_KEY_ALL_PROFILES);
      logger.info("Redis cache invalidated for bisnis_profiles:all");

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
      let cached = null;

      try {
        cached = await redisClient.get(CACHE_KEY_ALL_PROFILES);
        if (cached) {
          logger.info("Cache hit for bisnis profiles", {
            cacheKey: CACHE_KEY_ALL_PROFILES,
          });
          return responseHelper.success(
            res,
            "Bisnis profiles fetched successfully (from cache)",
            JSON.parse(cached),
          );
        } else {
          logger.info("Cache miss for bisnis profiles", {
            cacheKey: CACHE_KEY_ALL_PROFILES,
          });
        }
      } catch (error) {
        logger.error("Error accessing Redis cache for bisnis profiles", {
          error,
        });
      }

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
