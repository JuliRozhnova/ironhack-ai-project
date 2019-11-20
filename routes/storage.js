const express = require("express");
const router = express.Router();

const Emotion = require("../models/Emotion");
const User = require("../models/User");

const loginCheck = _ => (req, res, next) =>
  req.user ? next() : res.redirect("/");

router.get("/", (req, res, next) => {
  Emotion.find({})
    .populate("user")
    .then(emotions => {
      const users = emotions.map(item => item.user);
      const unique = [...new Set(users)];
      res.render("storage/storage", {
        users: unique,
        owner: req.user._id,
        emotions: emotions
      });
    })
    .catch(err => next(err));
});

router.post("/:userId", (req, res, next) => {
  Emotion.find({
    user: req.params.userId
  })
    .populate("user")
    .then(emotions => {
      let fav = emotions.filter(item => item.favourite && item);
      req.body.value.toString() === "fav" ? res.json(fav) : res.json(emotions);
    })
    .catch(err => next(err));
});

router.get("/:userId", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.find({
        user: user
      })
        .populate("user")
        .then(emotions => {
          res.render("storage/userStorage", {
            emotions: emotions,
            user: user,
            ownerRights:
              emotions[0].user._id.toString() == req.user._id.toString() ||
              req.user.role === "admin",
            owner: req.user._id
          });
        });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/:userId/:emotionId", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Emotion.findById(req.params.emotionId).then(emotion => {
        res.render("storage/userStorageEmotion", {
          emotion: emotion,
          emotions: [emotion],
          user: user,
          ownerRights:
            emotion.user._id.toString() == req.user._id.toString() ||
            req.user.role === "admin",
          owner: req.user._id
        });
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/:userId/:emotionId/fav", loginCheck(), (req, res, next) => {
  Emotion.findByIdAndUpdate(
    req.params.emotionId,
    {
      favourite: true
    },
    { new: true }
  )
    .then(_ => {
      res.redirect(`/storage/${req.params.userId}`);
    })
    .catch(err => next(err));
});

router.get("/:userId/:emotionId/notfav", loginCheck(), (req, res, next) => {
  Emotion.findByIdAndUpdate(
    req.params.emotionId,
    {
      favourite: false
    },
    { new: true }
  )
    .then(_ => {
      res.redirect(`/storage/${req.params.userId}`);
    })
    .catch(err => next(err));
});

router.get("/:userId/:emotionId/delete", loginCheck(), (req, res, next) => {
  Emotion.findByIdAndRemove(req.params.emotionId)
    .then(_ => {
      res.redirect(`/storage/${req.params.userId}`);
    })
    .catch(err => next(err));
});

module.exports = router;
