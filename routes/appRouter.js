const express = require("express");

const userController = require("../controller/user");

const router = express.Router();

router.get("/", userController.getIndex);

router.get("/login", userController.getLogin);

router.post("/login", userController.postLogin);

router.get("/signup", userController.getSignUp);

router.post("/signup", userController.postSignUp);

module.exports = { router };
