const express = require('express');
const {body} = require('express-validator')
const asyncHandler = require('express-async-handler')

const {isAuth} = require('../helper/isAuth')
const messageControllers = require('../controllers/messageControllers')

const router = express.Router();


router.get('/getMessages', isAuth, asyncHandler(messageControllers.getMessages))

router.get('/getMessagesCount', isAuth, asyncHandler(messageControllers.getMessagesCount))



module.exports = router;