const express = require("express");
const router = express.Router();
const Emotion = require("../models/Emotion");

router.get("/", (req, res, next) => {
  Emotion.find({ user: req.user._id })
    .then(emotions => {
      res.render("index", { owner: req.user, emotions: emotions });
    })
    .catch(err => next(err));
});

module.exports = router;
