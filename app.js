const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const appRoute = require("./routes/appRouter");

const app = express();

app.use(express.static("views"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

const MONGO_URI =
  "mongodb+srv://aa1aac:ipQS0vWOEHBlpB9V@cluster0-tpqkz.mongodb.net/blood";

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
