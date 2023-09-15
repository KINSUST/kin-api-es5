const mongoose = require("mongoose");

const EcSchema = mongoose.Schema(
  {
    name: {
      type: String, //17th executive committee , 18th executive committee
      required: true,
    },
    year: {
      type: Number, // 2022, 2023
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        index: {
          type: Number,
        },
        designation: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EC", EcSchema);
