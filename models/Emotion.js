const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emotionSchema = new Schema({
  emotion: String,
  photo: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

const Emotion = mongoose.model("Emotion", emotionSchema);
module.exports = Emotion;
