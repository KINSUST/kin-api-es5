const mongoose = require("mongoose");

// create advisor schema
const advisorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Advisor name is required!"],
    },
    designation: {
      type: String,
      required: [true, "Advisor designation is required!"],
      trim: true,
    },
    institute: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    cell: {
      type: String,
      trim: true,
    },
    advisor_photo: {
      type: String,
      required: [true, "Advisor photo is required!"],
    },
    website: {
      type: String,
    },
    index: {
      type: Number,
      default: 99,
    },
  },
  {
    timestamps: true,
  }
);

// export model
module.exports = mongoose.model("Advisor", advisorSchema);
