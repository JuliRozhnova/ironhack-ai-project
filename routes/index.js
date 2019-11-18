const express = require("express");
const router = express.Router();
const Emotion = require("../models/Emotion");
const User = require("../models/User");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});

const loginCheck = _ => (req, res, next) =>
  req.user ? next() : res.redirect("/");

router.get("/photo", loginCheck(), (req, res, next) => {
  res.render("photo", { user: req.user });
});

router.post("/photo", loginCheck(), (req, res, next) => {
  const { emotion, photo } = req.body;
  const user = req.user._id;

  Emotion.create({
    emotion: emotion,
    photo: photo,
    user: user
  })
    .then(emotion => {
      res.json(emotion);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/photo/storage/:userId/", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.find({ user: req.params.userId }).then(emotions => {
        res.render("userStorage", { emotions: emotions, user: user });
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/photo/playlist/:userId/:emotionId", (req, res, next) => {
  console.log(req.params);
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.findById(req.params.emotionId).then(emotion => {
        res.render("playlistDetails", { emotion: emotion, user: user });
      });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
