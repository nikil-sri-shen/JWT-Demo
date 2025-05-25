const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please, Enter Email!"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please, Enter a valid Email!"],
  },
  password: {
    type: String,
    required: [true, "Please, Enter Password!"],
    minLength: [6, "Minimum Password Length is 6 Characters"],
  },
});

//fire function after user created
userSchema.post("save", function (doc, next) {
  console.log("New User Created!", doc);
  next();
});

//fire function before user created
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
