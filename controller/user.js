const bcrypt = require("bcryptjs");

const User = require("../model/user");

exports.getIndex = (req, res, next) => {
  return res.render("index", {
    isAuthenticated: req.session.isLoggedIn,
    title: "home",
    data: [1, 2, 3, 4, 5, 6, 7, 8]
  });

  // return res.render("index", {
  //   isAuthenticated: req.session.isLoggedIn,
  //   title: "home"
  // });
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    error: null,
    isAuthenticated: req.session.isLoggedIn,
    title: "login"
  });
};

exports.postLogin = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      res.render("login", {
        error: "no user found! Please check the email you entered ",
        isAuthenticated: req.session.isLoggedIn,
        title: "login"
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
          error: "your password was incorrect. Re-enter your correct password",
          isAuthenticated: req.session.isLoggedIn,
          title: "login"
        });
      })
      .catch(err => {
        console.log(err);
        res.redirect("/login");
      });
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("signup", {
    error: null,
    title: "signup",
    isAuthenticated: req.session.isLoggedIn
  });
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
      error: "age",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup"
    });
  }
  if (confirmPassword !== password) {
    res.render("signup", {
      error: "password",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup"
    });
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
            .then(res.redirect("/login"))
            .catch(err => console.log(err));
        });
      } else {
        res.render("signup", {
          error: "user",
          isAuthenticated: req.session.isLoggedIn
        });
      }
    });
  } else {
    res.render("signup", {
      error: "DATA",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup"
    });
  }
};

exports.getLogOut = (req, res, next) => {
  let dataSet = [];
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
};

exports.getData = (req, res, next) => {
  let dataSet = [];
  if (req.session.isLoggedIn) {
    const counter = value => {
      return User.countDocuments({ bloodGroup: value });
    };
    let ap = counter("A+");
    let an = counter("A-");
    let bp = counter("B+");
    let bn = counter("B-");
    let op = counter("O+");
    let on = counter("O-");
    let abp = counter("AB+");
    let abn = counter("AB-");
    ap.then(count => dataSet.push({ "A+": count }));
    an.then(count => dataSet.push({ "A-": count }));
    bp.then(count => dataSet.push({ "B+": count }));
    bn.then(count => dataSet.push({ "B-": count }));
    op.then(count => dataSet.push({ "O+": count }));
    on.then(count => dataSet.push({ "O-": count }));
    abp.then(count => dataSet.push({ "AB+": count }));
    abn.then(count => {
      dataSet.push({ "AB-": count });
      console.log(dataSet);
      res.json(dataSet);
    });
  }
};
