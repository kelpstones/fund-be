const compareOpportunitiesModel = require("../models/compareOpportunities");
const response = require("../utils/response");

class CompareOpportunitiesController {
 
  async compare(req, res) {
    try {
      const rawIds = req.query.ids;

      if (!rawIds) {
        return response.error(res, "Parameter ids wajib diisi", 400);
      }

      const ids = rawIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      const data = await compareOpportunitiesModel.compareByIds(ids);

      return response.success(res, "Data perbandingan peluang", data);
    } catch (error) {
      if (error.status) {
        return response.error(res, error.message, error.status);
      }
      return response.serverError(res, error);
    }
  }
}

module.exports = CompareOpportunitiesController;