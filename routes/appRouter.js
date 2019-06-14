const express = require("express");

const shopController = require("../controller/blood");

const router = express.Router();

router.get("/", shopController.getIndex);

module.exports = { router };
