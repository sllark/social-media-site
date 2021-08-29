const express = require('express');
const {body} = require('express-validator')

const {isAuth} = require('../helper/isAuth')
const postControllers = require('../controllers/postControllers')

const router = express.Router();


router.post('/createPost', isAuth, postControllers.createPost)

router.post('/deletePost', isAuth, postControllers.deletePost)

router.get('/getPosts', isAuth, postControllers.getPosts)

router.post('/likePost', isAuth, postControllers.likePost)

router.post('/sharePost', isAuth, postControllers.sharePost)

router.post('/commentPost', isAuth, postControllers.commentPost)

router.post('/likeComment', isAuth, postControllers.likeComment)



module.exports = router;















