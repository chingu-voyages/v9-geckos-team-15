const bcrypt = require("bcryptjs");

const User = require("../model/user");

exports.getIndex = (req, res, next) => {
  res.render("index");
};

exports.getLogin = (req, res, next) => {
  res.render("login", { error: null });
};

exports.postLogin = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      res.render("login", {
        error: "no user found! Please check the email you entered "
      });
    }
    bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect("/");
          });
        }
        return res.status(422).render("login", {
          path: "/login",
          error: null
        });
      })
      .catch(err => {
        console.log(err);
        res.redirect("/login");
      });
  });
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
  if (name && email && age && password && confirmPassword && bloodGroup) {
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
  } else {
    res.render("signup", { error: "DATA" });
  }
};
