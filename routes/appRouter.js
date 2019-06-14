const express = require("express");

const bloodController = require("../controller/blood");
const userController = require("../controller/user");

const router = express.Router();

router.get("/", bloodController.getIndex);

router.get("/login", userController.getLogin);

router.get("/signUp", userController.getSignUp);

module.exports = { router };
