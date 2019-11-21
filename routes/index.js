const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { owner: req.user });
});
router.get("/about", (req, res, next) => {
  res.render("about", { owner: req.user });
});
module.exports = router;
