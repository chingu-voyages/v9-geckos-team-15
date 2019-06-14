const bcrypt = require("bcryptjs");

const User = require("../model/user");

exports.getLogin = (req, res, next) => {
  res.render("login");
};

exports.postLogin = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  console.log(email, password);
  next();
};

exports.getSignUp = (req, res, next) => {
  res.render("signup", { error: null });
};

exports.postSignUp = (req, res, next) => {
  const { name } = req.body;
  const { email } = req.body;
  const { age } = req.body;
  const { password } = req.body;
  const { confirmPassword } = req.body;
  const { bloodGroup } = req.body;

  if (age <= 17) {
    res.render("signup", {
      error: "age"
    });
  }
  if (confirmPassword !== password) {
    res.render("signup", { error: "password" });
  }

  User.findOne({ email: email }).then(user => {
    if (!user) {
      bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
          email,
          password: hashedPassword,
          name,
          age,
          bloodGroup
        });
        return user
          .save()
          .then(res.render("login"))
          .catch(err => console.log(err));
      });
    } else {
      res.render("signup", { error: "user" });
    }
  });
};
