const BisnisProfiles = require("../models/bisnis_profiles");
const Bisnis = require("../models/bisnis");
const responseHelper = require("../utils/response");

exports.RequireBisnisProfile = async (req, res, next) => {
  try {
    console.log("Checking bisnis profile for user:", req.user.id);
    const bisnis = await Bisnis.getBisnisByUserId(req.user.id);
    if (!bisnis) {
      return responseHelper.error(res, "Bisnis not found", 404);
    }

    const profile = await BisnisProfiles.getProfileByBisnisId(bisnis.id);
    if (!profile) {
      return responseHelper.error(
        res,
        "For this bisnis, the profile is not found. Please complete your bisnis profile before creating a pengajuan.",
        400
      );
    }

    req.bisnis = bisnis;
    req.bisnis_profile = profile;

    next();
  } catch (error) {
    logger.error("An error occurred while checking bisnis profile", { error });
    return responseHelper.serverError(res, "An error occurred");
  }
};