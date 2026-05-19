const express = require("express");
const BisnisCoverController = require("../controllers/bisnisCoverController");
const { Auth, Role } = require("../middlewares");
const multer = require("multer");
const { upload } = require("../config/cloudinary");



class BisnisCoverRoutes {
  constructor() {
    this.router = express.Router();
    this.controller = new BisnisCoverController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.use(Role.authorize("umkm"));

    this.router.get("/", (req, res) => {
      this.controller.getCovers(req, res);
    });

    this.router.post("/", upload.single("image"), (req, res) => {
      this.controller.uploadCover(req, res);
    });

    this.router.patch("/reorder", (req, res) => {
      this.controller.reorderCovers(req, res);
    });

    this.router.delete("/:id", (req, res) => {
      this.controller.deleteCover(req, res);
    });

    return this.router;
  }
}

module.exports = BisnisCoverRoutes;
