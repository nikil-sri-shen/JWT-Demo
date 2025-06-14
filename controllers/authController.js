const User = require("../models/User");
var jwt = require("jsonwebtoken");
//handle Errors
handleErrors = (err) => {
  console.log(err.message, err.code);
  let error = { email: "", password: "" };

  //incorrect email
  if (err.message === "incorrect email") {
    error.email = "Email is not registered!";
  }

  //incorrect password
  if (err.message === "incorrect password") {
    error.password = "Password is incorrect!";
  }

  if (err.code === 11000) {
    //duplication errors
    error.email = "Email is alrealy present!";
    return error;
  }

  //validate errors
  if (err.message.includes("user validation failed:")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
    console.log(error);
    return error;
  }

  return error;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "jwt demo secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const error = handleErrors(err);
    console.log(error);
    res.status(400).json({ error });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
