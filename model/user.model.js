const mongoose = require("mongoose");
const hashPassword = require("../helper/hashPassword.js");
const { defaultUserPhoto } = require("../secret.js");

// create user schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required!.Please provide your full name."],
    },
    email: {
      type: String,
      required: [true, "Email is required!.Please provide your email."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    gender: {
      type: String,
      lowercase: true,
      required: [true, "Gender is required!.Please provide your gender."],
      enum: ["male", "female"],
    },
    identity: {
      sustian: {
        department: {
          type: String,
          trim: true,
        },
        session: {
          type: String,
          trim: true,
        },
      },
      nonSustian: {
        profession: {
          type: String,
          trim: true,
        },
        organization: {
          type: String,
          trim: true,
        },
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required!.Please provide your password."],
      set: (pass) => hashPassword(pass),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    mobile: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "superAdmin"],
      default: "user",
    },
    user_photo: {
      type: String,
      default: defaultUserPhoto,
    },
    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB-", "AB+", "O+", "O-"],
    },
    age: {
      type: Number,
    },
    location: {
      type: String,
    },
    feedback: {
      type: String,
    },
    social_media: {
      fb: {
        type: String,
      },
      instagram: {
        type: String,
      },
      linkedIn: {
        type: String,
      },
    },

    trash: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
