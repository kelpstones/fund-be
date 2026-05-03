const express = require("express");
const router = express.Router();
const { Auth } = require("../middlewares");
const { Role } = require("../middlewares");
const kelasController = require("../controllers/kelasController");
class KelasRoutes {
  constructor() {
    this.router = router;
    this.kelasController = new kelasController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);

    this.router.get(
      "/",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.kelasController.getAllKelas(req, res);
      },
    );

    this.router.post("/", Role.authorize("admin", "superadmin"), (req, res) => {
      this.kelasController.createKelas(req, res);
    });

    this.router.get(
      "/:id",
      Role.authorize("umkm", "investor", "superadmin", "admin"),
      (req, res) => {
        this.kelasController.getKelasById(req, res);
      },
    );

    this.router.put(
      "/:id",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.kelasController.updateKelas(req, res);
      },
    );

    this.router.delete(
      "/:id",
      Role.authorize("admin", "superadmin"),
      (req, res) => {
        this.kelasController.deleteKelas(req, res);
      },
    );
    return this.router;
  }
}

module.exports = KelasRoutes;
