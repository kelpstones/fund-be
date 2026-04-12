const express = require("express");
const response = require("../utils/response");
const router = express.Router();
const UserRoutes = require("./userRoutes");

router.get("/", (req, res) => {
  return response.success(res, "Berhasil diakses");
});

router.use("/user", new UserRoutes().routes());

module.exports = router;
