const mongoose = require("mongoose");

// create program schema
const programSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide program title"],
    },
    program_photo: {
      type: String,
      required: [true, "Please upload a program photo"],
    },
    fb_url: {
      type: String,
      required: [true, "Please provide  facebook URL"],
    },

    // date: {
    //   type: String,
    //   required: [true, "Please provide a date"],
    // },
    start_date: {
      type: String,
      required: [true, "Please provide program start date"],
    },
    end_date: {
      type: String,
    },
    // time: {
    //   type: String,
    //   required: [true, "Please provide a time"],
    // },
    start_time: {
      type: String,
      required: [true, "Please provide program start time"],
    },
    end_time: {
      type: String,
    },
    venue: {
      type: String,
      required: [true, "Please provide a venue"],
    },
  },
  {
    timestamps: true,
  }
);

// export program model
module.exports = mongoose.model("Program", programSchema);
