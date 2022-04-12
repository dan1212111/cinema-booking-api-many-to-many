const express = require('express')
const router = express.Router()

const controller = require('../controller/ticket')

router.post("/", controller.bookTicket)

module.exports = router