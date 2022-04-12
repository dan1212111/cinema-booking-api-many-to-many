const express = require("express");
const controller = require('../controllers/seat');
const router = express.Router();

router.get("/", controller.getSeat);

module.exports = router;