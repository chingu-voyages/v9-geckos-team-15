const express = require("express");
const bodyParser = require("body-parser");

const appRoute = require("./routes/appRouter");

const app = express();

app.use(express.static("views"));
app.use(express.static("public"));

app.set("view engine", "ejs");
// route handelling
app.use("/", appRoute.router);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`deployed on port ${PORT}`);
});
