const express = require("express");
const router = express.Router();

const Emotion = require("../models/Emotion");
const User = require("../models/User");

const { google } = require("googleapis");
const shuffle = require("../utils/functions");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_CLIENT_KEY2
});

const loginCheck = _ => (req, res, next) =>
  req.user ? next() : res.redirect("/");

router.get("/", loginCheck(), (req, res, next) => {
  res.render("photo/photo", {
    user: req.user,
    path: req.route.path,
    owner: req.user._id
  });
});

router.post("/", loginCheck(), (req, res, next) => {
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

router.get("/playlist/:userId/:emotionId", loginCheck(), (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.findById(req.params.emotionId).then(emotion => {
        youtube.search
          .list({
            part: "snippet",
            maxResults: 10,
            order: "relevance",
            q: `${emotion.emotion} music`,
            relevanceLanguage: "en",
            type: "playlist",
            safeSearch: "moderate"
          })
          .then(response => {
            let result = response.data.items;
            let resultPlaylist = [];
            resultPlaylist = shuffle(result);

            Emotion.findByIdAndUpdate(
              req.params.emotionId,
              {
                playlists: resultPlaylist
              },
              { new: true }
            ).then(emotion => {
              res.render("photo/playlistDetails", {
                emotion: emotion,
                user: user,
                owner: req.user._id
              });
            });
          });
      });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
