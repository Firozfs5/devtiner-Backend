const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 10,
    },
    emailId: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value))
          throw new Error("there a invalis email entered");
      },
    },
    password: {
      type: String,
      min: 8,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate: {
        validator: (v) => ["male", "female", "others"].includes(v),
        message: "Gender is invalid ",
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://www.google.com/imgres?q=photo%20full%20passoprt%20size%20dummy&imgurl=https%3A%2F%2Fongcvidesh.com%2Fwp-content%2Fuploads%2F2019%2F08%2Fdummy-image.jpg&imgrefurl=https%3A%2F%2Fongcvidesh.com%2Fcompany%2Fboard-of-directors%2Fdummy-image%2F&docid=wMqD_3Kr1DPkrM&tbnid=l4re0hUB_4ii0M&vet=12ahUKEwinyZSbhY6WAxVoSmwGHZjvKP0QnPAOegQISxAA..i&w=452&h=449&hcb=2&ved=2ahUKEwinyZSbhY6WAxVoSmwGHZjvKP0QnPAOegQISxAA",
    },
    about: {
      type: String,
      maxlength: 150,
      // default: "This is about ur profile",
    },
    skills: { type: [String] },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
