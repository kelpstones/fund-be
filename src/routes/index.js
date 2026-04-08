const express = require("express");
const response = require("../utils/response");
const router = express.Router();

router.get("/", (req, res) => {
  return response.success(res, "Berhasil diakses");
});

module.exports = router;
