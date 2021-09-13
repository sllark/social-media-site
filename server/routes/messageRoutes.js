const express = require('express');
const {body} = require('express-validator')
const asyncHandler = require('express-async-handler')

const {isAuth} = require('../helper/isAuth')
const validateObjectID = require('../helper/validateObjectID')
const messageControllers = require('../controllers/messageControllers')

const router = express.Router();


router.get('/getMessages', isAuth, asyncHandler(messageControllers.getMessages))

router.get('/getMessagesCount', isAuth, asyncHandler(messageControllers.getMessagesCount))

router.get('/getChats', isAuth, asyncHandler(messageControllers.getChats))

router.get('/getTotalChats', isAuth, asyncHandler(messageControllers.getTotalChats))

router.post('/updateUnreadChat', isAuth, validateObjectID("postID"), asyncHandler(messageControllers.updateUnreadChat))

router.get('/getUnreadMessages', isAuth, validateObjectID("postID"), asyncHandler(messageControllers.getUnreadMessages))

router.get('/getLatestChatID', isAuth, validateObjectID("postID"), asyncHandler(messageControllers.getLatestChatID))


module.exports = router;