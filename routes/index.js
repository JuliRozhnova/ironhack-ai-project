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

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { owner: req.user });
});

const loginCheck = _ => (req, res, next) =>
  req.user ? next() : res.redirect("/");

router.get("/photo", loginCheck(), (req, res, next) => {
  res.render("photo/photo", {
    user: req.user,
    path: req.route.path,
    owner: req.user._id
  });
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

router.get(
  "/photo/playlist/:userId/:emotionId",
  loginCheck(),
  (req, res, next) => {
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
              )
                .then(emotion => {
                  console.log(emotion);
                  res.render("photo/playlistDetails", {
                    emotion: emotion,
                    user: user,
                    owner: req.user._id
                  });
                })
                .catch(err => console.log(`Error: ${err.message}`));
            });
        });
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get("/storage/:userId/", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.find({
        user: req.params.userId
      })
        .populate("user")
        .then(emotions => {
          res.render("storage/userStorage", {
            emotions: emotions,
            user: user,
            showDelete:
              emotions[0].user._id.toString() == req.user._id.toString(),
            owner: req.user._id
          });
        });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/storage", (req, res, next) => {
  User.find({})
    .then(docs => {
      res.render("storage/storage", { users: docs, owner: req.user._id });
    })
    .catch(err => next(err));
});

router.get("/storage/:userId/:emotionId", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.findById(req.params.emotionId).then(emotion => {
        res.render("storage/userStorageEmotion", {
          emotion: emotion,
          user: user,
          showDelete: emotion.user._id.toString() == req.user._id.toString(),
          owner: req.user._id
        });
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post(
  "/storage/:userId/:emotionId/delete",
  loginCheck(),
  (req, res, next) => {
    Emotion.findByIdAndRemove(req.params.emotionId)
      .then(_ => {
        res.redirect(`/storage/${req.params.userId}`);
      })
      .catch(err => next(err));
  }
);

module.exports = router;
