const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  // profilepic: {type: String, required: true},
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
