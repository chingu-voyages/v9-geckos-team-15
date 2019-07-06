const bcrypt = require("bcryptjs");
const SparkPost = require("sparkpost");
const uniqueId = require("uniqid");

const User = require("../model/user");

const client = new SparkPost();

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
    isAuthenticated: req.session.isLoggedIn,
    data: { name: "", email: "", age: null, bloodGroup: "" }
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
    return res.render("signup", {
      error: "age",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup",
      data: { name, email, age, bloodGroup }
    });
  }
  if (confirmPassword !== password) {
    return res.render("signup", {
      error: "password",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup",
      data: { name, email, age, bloodGroup }
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
            .then(user => {
              client.transmissions
                .send({
                  options: {
                    sandbox: true
                  },
                  content: {
                    from: "smtp@smtp.sparkpostmail.com",
                    subject: "Thank you for sigining up",
                    html: `<html>
                      <body> 
                       <hr>
                        <header style=" text-align: center; font-size:20px"> </header> 
                      </hr>
                      <p> 
                        Thank you for logging in to help the people in need
                      </p>
                      <br>
                      <hr>
                      --blood Help
                     </body>
                    </html>`
                  },
                  recipients: [{ address: email }]
                })
                .then(data => {
                  console.log("Woohoo! You just sent your first mailing!");
                  console.log(data);
                })
                .catch(err => {
                  console.log("Whoops! Something went wrong");
                  console.log(err);
                });
              res.redirect("/login");
            })
            .catch(err => console.log(err));
        });
      } else {
        res.render("signup", {
          error: "user",
          isAuthenticated: req.session.isLoggedIn,
          data: { name, age, email, bloodGroup }
        });
      }
    });
  } else {
    res.render("signup", {
      error: "DATA",
      isAuthenticated: req.session.isLoggedIn,
      title: "signup",
      data: { name, age, email, bloodGroup }
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
    ap.then(count => {
      dataSet.push({ "A+": count });
      return an;
    })
      .then(count => {
        dataSet.push({ "A-": count });
        return bp;
      })
      .then(count => {
        dataSet.push({ "B+": count });
        return bn;
      })
      .then(count => {
        dataSet.push({ "B-": count });
        return op;
      })
      .then(count => {
        dataSet.push({ "O+": count });
        return on;
      })
      .then(count => {
        dataSet.push({ "O-": count });
        return abp;
      })
      .then(count => {
        dataSet.push({ "AB+": count });
        return abn;
      })
      .then(count => {
        dataSet.push({ "AB-": count });
        return res.json(dataSet);
      });
  }
};

exports.searchData = (req, res, next) => {
  if (req.session.isLoggedIn) {
    const PEOPLE_PER_PAGE = 2;
    const page = +req.query.page || 1;
    let totalPeople;
    let value = req.query.search;
    let bloodGroupSign = value.split("")[value.length - 1];
    let bloodGroupview;
    console.log(bloodGroupSign);
    if (bloodGroupSign === "+") {
      let newValue;
      newValue = value.split("");
      newValue.pop();
      newValue.push("%2B");
      newValue.concat();
      bloodGroupview = newValue.join("");
      console.log(bloodGroupview);
    } else {
      bloodGroupview = value;
    }
    value = value.toUpperCase();
    // search data
    User.find({ bloodGroup: value })
      .countDocuments()
      .then(numPeople => {
        totalPeople = numPeople;
        return User.find({ bloodGroup: value })
          .skip((page - 1) * PEOPLE_PER_PAGE)
          .limit(PEOPLE_PER_PAGE);
      })
      .then(data => {
        res.render("search", {
          data,
          isAuthenticated: true,
          bloodGroup: bloodGroupview,
          currentPage: page,
          page,
          hasNextPage: PEOPLE_PER_PAGE * page < totalPeople,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalPeople / PEOPLE_PER_PAGE)
        });
      });
    //render data to the user
  } else {
    res.redirect("/");
  }
};

exports.getForgot = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("forgot", {
      isAuthenticated: false,
      error: null,
      message: null
    });
  }
  return res.redirect("/");
};

exports.postForgot = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        const token = uniqueId();
        user.resetToken = token;
        console.log(token);
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save().then(result => {
          client.transmissions
            .send({
              options: {
                sandbox: true
              },
              content: {
                from: "testing@sparkpostbox.com",
                subject: "Reset your password",
                html: `<html><body><p>
                <header><h4>Blood help </h4> </header>
                <br>
                follow the link below to reset your password:
                localhost:3000/new-password/${token}
              </p>
              <br>
              <hr>
              --blood Help
              </body></html>`
              },
              recipients: [{ address: req.body.email }]
            })
            .then(data => {
              console.log("sent");
            })
            .catch(err => {
              console.log(err);
              console.log("Something went wrong");
            });
        });
        return res.render("forgot", {
          isAuthenticated: false,
          message:
            "please chek your email that we have sent to reset your password"
        });
      }
      if (!user) {
        return res.render("forgot", {
          isAuthenticated: false,
          message: "no such user found! Please re-enter the email-adress"
        });
      }
    });
  } else {
    res.redirect("/");
  }
};

exports.getNewPassword = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    const { token } = req.params;
    User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    })
      .then(result => {
        if (result) {
          console.log(result);
          res.render("newPassword", {
            isAuthenticated: false,
            error: null,
            token,
            userId: result._id
          });
        }
      })
      .catch(err => {
        res.redirect("/");
      });
  } else {
    res.redirect("/");
  }
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  const token = req.body.token;
  const userId = req.body.userId;
  console.log(password, confirmpassword, token, userId);
  if (password === confirmpassword) {
    let resetUser;
    User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    })
      .then(user => {
        if (user) {
          resetUser = user;
          console.log(user);
          console.log(resetUser);
          return bcrypt.hash(password, 12);
        }
      })
      .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      })
      .then(result => {
        res.redirect("/login");
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    res.render("newPassword", {
      isAuthenticated: false,
      error: "the password and confirm password do not match! please re-enter",
      userId: req.body.userId,
      token: req.body.token
    });
  }
};
