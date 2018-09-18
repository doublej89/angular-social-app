const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  avatar: { type: String },
  name: { type: String },
  date: {
    type: Date,
    default: Date.now()
  },
  comments: [
    {
      creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: {
        type: String,
        required: true
      },
      name: { type: String },
      avatar: { type: String },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  likes: [
    {
      creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ]
});

module.exports = mongoose.model("Post", postSchema);
