const express = require("express");

const isAuth = require("../util/auth").isAuth;

const userController = require("../controller/user");

const router = express.Router();

router.get("/", userController.getIndex);

router.get("/login", userController.getLogin);

router.post("/login", userController.postLogin);

router.get("/signup", userController.getSignUp);

router.post("/signup", userController.postSignUp);

router.get("/logout", userController.getLogOut);

router.get("/index-data-set", userController.getData);

router.post("/search", userController.searchData);

router.get("/forgot", userController.getForgot);

router.post("/forgot", userController.postForgot);

module.exports = { router };
