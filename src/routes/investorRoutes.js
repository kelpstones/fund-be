const express = require("express");
const router = express.Router();
const { Auth, Role } = require("../middlewares");
const PreferensiInvestorController = require("../controllers/preferensiInvestorController");
const BookmarksController = require("../controllers/bookmarksController");
class InvestorRoutes {
  constructor() {
    this.router = router;
    this.preferensiInvestorController = new PreferensiInvestorController();
    this.bookmarkController = new BookmarksController();
  }

  routes() {
    this.router.use(Auth.verifyAnyToken);
    this.router.post("/preferences", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.submitPreferensi(req, res);
    });

    this.router.get("/preferences", Role.authorize("investor"), (req, res) => {
      this.preferensiInvestorController.getPreferensi(req, res);
    });

    this.router.get(
      "/recommendations",
      Role.authorize("investor"),
      (req, res) => {
        this.preferensiInvestorController.getRekomendasi(req, res);
      },
    );

    this.router.post(
      "/preferences/refresh",
      Role.authorize("investor"),
      (req, res) => {
        this.preferensiInvestorController.refreshRekomendasi(req, res);
      },
    );

    // bookmark routes
    this.router.post("/bookmarks", Role.authorize("investor"), (req, res) => {
      this.bookmarkController.createBookmark(req, res);
    });

    this.router.get("/bookmarks", Role.authorize("investor"), (req, res) => {
      this.bookmarkController.getBookmarks(req, res);
    });

    this.router.delete(
      "/bookmarks/:bisnis_id",
      Role.authorize("investor"),
      (req, res) => {
        this.bookmarkController.deleteBookmark(req, res);
      },
    );

    this.router.get(
      "/bookmarks/:bisnis_id",
      Role.authorize("investor"),
      (req, res) => {
        this.bookmarkController.isBookmarked(req, res);
      },
    );

    return this.router;
  }
}

module.exports = InvestorRoutes;
