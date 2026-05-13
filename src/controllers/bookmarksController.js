const Bookmark = require("../models/bookmarks");
const responseHelper = require("../utils/response");
const logger = require("../utils/index").logger;
class BookmarksController {
  async createBookmark(req, res) {
    try {
      const { bisnis_id } = req.body;
      const investor_id = req.user.id;

      if (!bisnis_id) {
        return responseHelper.error(res, "bisnis_id is required", 400);
      }

      const bookmark = await Bookmark.createBookmark(investor_id, bisnis_id);
      return responseHelper.created(
        res,
        "Bookmark created successfully",
        bookmark,
      );
    } catch (error) {
      if (error.status) {
        return responseHelper.error(
          res,
          error.message || "An error occurred while creating bookmark",
          400,
        );
      }
      return responseHelper.serverError(
        res,
        error.message || "An error occurred while creating bookmark",
        error.status || 500,
      );
    }
  }

  async getBookmarks(req, res) {
    try {
      const investor_id = req.user.id;
      const bookmarks = await Bookmark.getBookmarksByInvestor(investor_id);
      return responseHelper.success(
        res,
        "Bookmarks fetched successfully",
        bookmarks,
      );
    } catch (error) {
      logger.error("Error fetching bookmarks:", error);
      return responseHelper.serverError(
        res,
        error.message || "An error occurred while fetching bookmarks",
        error.status || 500,
      );
    }
  }

  async deleteBookmark(req, res) {
    try {
      const { bisnis_id } = req.params;
      const investor_id = req.user.id;

      const success = await Bookmark.deleteBookmark(investor_id, bisnis_id);
      if (!success) {
        return responseHelper.error(res, "Bookmark not found", 404);
      }
      return responseHelper.success(res, "Bookmark deleted successfully");
    } catch (error) {
      logger.error("Error deleting bookmark:", error);
      if (error.status) {
        return responseHelper.error(
          res,
          error.message || "An error occurred while deleting bookmark",
          error.status,
        );
      }
      return responseHelper.serverError(
        res,
        error.message || "An error occurred while deleting bookmark",
        error.status || 500,
      );
    }
  }

  async isBookmarked(req, res) {
    try {
      const { bisnis_id } = req.params;
      const investor_id = req.user.id;

      const isBookmarked = await Bookmark.isBookmarked(investor_id, bisnis_id);
      return responseHelper.success(
        res,
        "Bookmark status fetched successfully",
        { isBookmarked },
      );
    } catch (error) {
      logger.error("Error checking bookmark status:", error);
      return responseHelper.serverError(
        res,
        error.message || "An error occurred while checking bookmark status",
        error.status || 500,
      );
    }
  }
}

module.exports = BookmarksController;
