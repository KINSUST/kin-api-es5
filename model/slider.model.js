const mongoose = require("mongoose");

//create slider schema

const sliderSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "slider title is required!"],
    },
    slider_photo: {
      type: String,
      required: [true, "slider photo is required!"],
    },
    link: {
      type: String,
      default: "",
    },
    index: {
      type: Number,
      default: 99,
    },
    url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// create slider collection
module.exports = mongoose.model("slider", sliderSchema);
