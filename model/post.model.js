const mongoose = require("mongoose");

//create schema

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
    },
    slug: {
      type: String,
      required: [true, "slug is required!"],
    },
    post_photo: {
      type: String,
      required: [true, "Photo is required!"],
    },
    banner:{
      type: String,
      required: [true, "Banner is required!"],
    },
    comment: {
      type: Array,
      default: [],
    },
    details: {
      type: String,
      require: true,
    },
    date:{
      type: String,
      require: true,
    }
  },
  {
    timestamps: true,
  }
);

// create users collecting(auto plural)

module.exports = mongoose.model("Post", postSchema);
