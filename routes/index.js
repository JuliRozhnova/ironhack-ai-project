const express = require("express");
const router = express.Router();
const Emotion = require("../models/Emotion");
const User = require("../models/User");
const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_CLIENT_KEY
});

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
        youtube.search
          .list({
            part: "snippet",
            q: `${emotion.emotion} music`,
            maxResults: 25
          })
          .then(response => {
            res.render("playlistDetails", {
              emotion: emotion,
              user: user,
              playlists: response.data.items
            });
            //console.log(response.data.items);
          });
      });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
