const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  name: { required: true, type: String },
  bloodGroup: { required: true, type: String },
  age: { required: true, type: String }
});

module.exports = mongoose.model("User", userSchema);
