const express = require("express");

const bloodController = require("../controller/blood");
const userController = require("../controller/user");

const router = express.Router();

router.get("/", bloodController.getIndex);

router.get("/login", userController.getLogin);

router.post("/login", userController.postLogin);

router.get("/signup", userController.getSignUp);

router.post("/signup", userController.postSignUp);

module.exports = { router };
