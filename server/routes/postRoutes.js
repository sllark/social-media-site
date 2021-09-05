const mongoose = require('mongoose')
const express = require('express');
const {body} = require('express-validator')
const asyncHandler = require('express-async-handler')

const {isAuth} = require('../helper/isAuth')
const validateObjectID = require('../helper/validateObjectID')

const postControllers = require('../controllers/postControllers')


const router = express.Router();


router.post('/createPost', isAuth, [body('postText').notEmpty()], asyncHandler(postControllers.createPost))

router.post('/deletePost', isAuth, validateObjectID("postID"), asyncHandler(postControllers.deletePost))

router.get('/getProfilePosts', isAuth, validateObjectID("profileID"), asyncHandler(postControllers.getProfilePosts))

router.post('/likePost', isAuth, validateObjectID("postID"), asyncHandler(postControllers.likePost))

router.post('/sharePost', isAuth, validateObjectID("postID"), asyncHandler(postControllers.sharePost))

router.post('/commentPost', isAuth, validateObjectID("postID"), [body('value').notEmpty()], asyncHandler(postControllers.commentPost))

router.post('/likeComment', isAuth, validateObjectID("commentID"), asyncHandler(postControllers.likeComment))

router.get('/getSinglePosts', isAuth,validateObjectID("postID"), asyncHandler(postControllers.getSinglePosts))

router.get('/getFeedPosts', isAuth, asyncHandler(postControllers.getFeedPosts))

router.get('/getFeedPostsCount', isAuth, asyncHandler(postControllers.getFeedPostsCount))

router.get('/getPostLikes', isAuth, validateObjectID("postID"),asyncHandler(postControllers.getPostLikes))


module.exports = router;















