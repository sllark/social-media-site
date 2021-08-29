const express = require('express');
const {body} = require('express-validator')

const {isAuth} = require('../helper/isAuth')
const messageControllers = require('../controllers/messageControllers')

const router = express.Router();


router.get('/getMessages', isAuth, messageControllers.getMessages)

router.get('/getMessagesCount', isAuth, messageControllers.getMessagesCount)



module.exports = router;