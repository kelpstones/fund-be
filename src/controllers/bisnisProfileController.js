const responseHelper = require("../utils/response");
const BisnisProfiles = require("../models/bisnis_profiles");
const Bisnis = require("../models/bisnis");
const { BisnisProfileValidator } = require("../validation");

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
        req.user.role_name === "bisnis" &&
        bisnis.pemilik.id !== req.user.id
      ) {
        return responseHelper.error(res, "Unauthorized", 403);
      }

      const profile = await BisnisProfiles.upsertProfile(bisnis_id, {
        net_profit_margin,
        kepuasan_pelanggan,
        peak_hour_latency,
        review_volatility,
        repeat_order_rate,
        digital_adoption_score,
        year_revenue,
        business_tenure_years,
      });

      return responseHelper.success(
        res,
        "Bisnis profile saved successfully",
        profile,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while saving bisnis profile",
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
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis profile",
      );
    }
  }

  async updateClass(req, res) {
    try {
      const { id: bisnis_id } = req.params;
      const { class: classValue } = req.body;

      if (classValue === undefined || classValue === null) {
        return responseHelper.error(res, "class wajib diisi", 400);
      }

      if (![0, 1, 2, 3].includes(parseInt(classValue))) {
        return responseHelper.error(
          res,
          "class harus 0 (Critical), 1 (Struggling), 2 (Growth), atau 3 (Elite)",
          400,
        );
      }

      const profile = await BisnisProfiles.getProfileByBisnisId(bisnis_id);
      if (!profile) {
        return responseHelper.error(res, "Bisnis profile not found", 404);
      }

      const updated = await BisnisProfiles.updateClass(
        bisnis_id,
        parseInt(classValue),
      );

      return responseHelper.success(
        res,
        "Bisnis class updated successfully",
        updated,
      );
    } catch (error) {
      console.error(error);
      return responseHelper.serverError(
        res,
        "An error occurred while updating bisnis class",
      );
    }
  }
}

module.exports = BisnisProfileController;
