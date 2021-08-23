const express = require('express');
const {body} = require('express-validator')

const {isAuth} = require('../helper/isAuth')
const postControllers = require('../controllers/postControllers')

const router = express.Router();


router.post('/createPost', isAuth, postControllers.createPost)

router.post('/deletePost', isAuth, postControllers.deletePost)

router.get('/getPosts', isAuth, postControllers.getPosts)

router.get('/getUser', isAuth, postControllers.getUser)

router.post('/likePost', isAuth, postControllers.likePost)

router.post('/commentPost', isAuth, postControllers.commentPost)

router.post('/likeComment', isAuth, postControllers.likeComment)



// profile controllers
router.get('/getProfileDetails', isAuth, postControllers.getProfileDetails)

router.post('/updateProfilePic', isAuth, postControllers.updateProfilePic)

router.post('/updateCoverPic', isAuth, postControllers.updateCoverPic)

router.post('/addBio', isAuth, postControllers.addBio)

router.post('/sendFriendReq', isAuth, postControllers.sendFriendReq)

router.post('/cancelFriendReq', isAuth, postControllers.cancelFriendReq)

router.post('/acceptFriendReq', isAuth, postControllers.acceptFriendReq)

router.post('/declineFriendReq', isAuth, postControllers.declineFriendReq)

router.get('/getNotifications', isAuth, postControllers.getNotifications)

router.get('/getFeedPosts', isAuth, postControllers.getFeedPosts)

router.get('/getFeedPostsCount', isAuth, postControllers.getFeedPostsCount)

router.get('/getMessages', isAuth, postControllers.getMessages)

router.get('/getMessagesCount', isAuth, postControllers.getMessagesCount)



module.exports = router;















