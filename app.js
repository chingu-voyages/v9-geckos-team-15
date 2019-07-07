const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const appRoute = require("./routes/appRouter");
const User = require("./model/user");

const app = express();

app.use(express.static("views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const { MONGO_URI } = process.env;

var store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions"
});

store.on("error", function(error) {
  console.log(error);
});

app.use(
  session({
    secret: "This is a secret",
    store: store,
    resave: true,
    saveUninitialized: true
  })
);

app.set("view engine", "ejs");
// route handelling
app.use("/", appRoute.router);

app.use("/", (req, res, next) => {
  res.render("404", { isAuthenticated: req.session.isLoggedin });
});
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true })
  .then(result => {
    app.listen(process.env.PORT || 3000);
    console.log("deployed");
  })
  .catch(err => {
    console.log(err);
  });
