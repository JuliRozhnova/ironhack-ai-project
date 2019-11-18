const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});

const loginCheck = _ => (req, res, next) =>
  req.user ? next() : res.redirect("/");

router.get("/photo", loginCheck(), (req, res, next) => {
  res.render("photo", { user: req.user });
});

module.exports = router;
