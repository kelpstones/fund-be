const express = require("express");
const router = express.Router();
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
const NegotiationController = require("../controllers/negosiasiController");

class NegotiationRoutes {
  constructor() {
    this.router = router;
    this.negotiationController = new NegotiationController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.negotiationController.getAllNegotiations(req, res);
      },
    );

    this.router.get("/user", Role.authorize("umkm", "investor"), (req, res) => {
      this.negotiationController.getNegotiationByUserId(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.negotiationController.getNegotiationByPengajuanId(req, res);
      },
    );

    this.router.post(
      "/accept/:id",
      Role.authorize("umkm", "investor"),
      (req, res) => {
        this.negotiationController.acceptNegotiation(req, res);
      },
    );

    this.router.post("/start", Role.authorize("investor"), (req, res) => {
      this.negotiationController.startNegotiation(req, res);
    });

    this.router.post(
      "/reply/:id",
      Role.authorize("umkm", "investor"),
      (req, res) => {
        this.negotiationController.replyNegotiation(req, res);
      },
    );

    return this.router;
  }
}

module.exports = NegotiationRoutes;
