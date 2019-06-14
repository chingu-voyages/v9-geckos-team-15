const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

const appRoute = require("./routes/appRouter");
const User = require("./model/user");

const app = express();

app.use(express.static("views"));
app.use(express.static("public"));

const MONGO_URI =
  "mongodb+srv://aa1aac:ipQS0vWOEHBlpB9V@cluster0-tpqkz.mongodb.net/blood";

const store = new mongoDBStore({
  uri: MONGO_URI,
  collection: "session"
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});
app.set("view engine", "ejs");
// route handelling
app.use("/", appRoute.router);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true })
  .then(result => {
    app.listen(process.env.PORT || 3000);
    console.log("deployed");
  })
  .catch(err => {
    console.log(err);
  });
