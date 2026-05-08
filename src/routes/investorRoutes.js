const express = require("express");
const router = express.Router();
const { Auth, Role } = require("../middlewares");
const PreferensiInvestorController = require("../controllers/preferensiInvestorController");
class InvestorRoutes {
  constructor() {
    this.router = router;
    this.preferensiInvestorController = new PreferensiInvestorController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.post("/preferences", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.submitPreferensi(req, res);
    });

    this.router.get("/preferences", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.getPreferensi(req, res);
    });

    this.router.get("/recommendations", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.getRekomendasi(req, res);
    });

    this.router.post("/preferences/refresh", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.refreshRekomendasi(req, res);
    });

    return this.router;
  }
}

module.exports = InvestorRoutes;