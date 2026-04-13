
const express = require("express");
const BisnisController = require("../controllers/bisnisController");
const verifyToken = require("../middlewares/auth");
const { BisnisValidator } = require("../validation");
class BisnisRoutes {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    this.router.use(verifyToken);
    this.router.use(BisnisValidator.bisnisTokenValidation);
    this.router.get("/", (req, res) => {
      const bisnisController = new BisnisController();
      bisnisController.getBisnis(req, res);
    });

    this.router.post("/", (req, res) => {
      const bisnisController = new BisnisController();
      bisnisController.createBisnis(req, res);
    });
    return this.router;
  }
}

module.exports = BisnisRoutes;
