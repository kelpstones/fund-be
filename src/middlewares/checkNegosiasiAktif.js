const db = require("../config/db");
const response = require("../utils/index").ResponseHelper;
const checkNegosiasiAktif = async (req, res, next) => {
  const activeNego = await db("pengajuans")
    .where({ bisnis_id: req.user.bisnis_id, status: "negotiating" })
    .first();

  if (activeNego) {
    return response.error(
      res,
      "Cannot create new negotiation while another negotiation is active for this business",
      403,
    );
  }

  next();
};

module.exports = checkNegosiasiAktif;