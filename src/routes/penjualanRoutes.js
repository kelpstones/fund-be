const express = require("express");
const PenjualansController = require("../controllers/penjualansController");
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");

class PenjualanRoutes {
  constructor() {
    this.router = express.Router();
    this.penjualansController = new PenjualansController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.penjualansController.getPenjualans(req, res);
      },
    );

    this.router.post("/", Role.authorize("umkm"), (req, res) => {
      this.penjualansController.createPenjualan(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.penjualansController.getPenjualanById(req, res);
      },
    );

    this.router.put("/:id", Role.authorize("umkm"), (req, res) => {
      this.penjualansController.updatePenjualan(req, res);
    });

    return this.router;
  }
}

module.exports = PenjualanRoutes;