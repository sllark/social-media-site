const express = require('express');
const {body} = require('express-validator')

const {isAuth} = require('../helper/isAuth')
const profileControllers = require('../controllers/profileControllers')

const router = express.Router();



// profile controllers
router.get('/getUser', isAuth, profileControllers.getUser)

router.get('/getSearchUsers', isAuth, profileControllers.getSearchUsers)

router.get('/getProfileDetails', isAuth, profileControllers.getProfileDetails)

router.post('/updateProfilePic', isAuth, profileControllers.updateProfilePic)

router.post('/updateCoverPic', isAuth, profileControllers.updateCoverPic)

router.post('/addBio', isAuth, profileControllers.addBio)

router.post('/sendFriendReq', isAuth, profileControllers.sendFriendReq)

router.post('/cancelFriendReq', isAuth, profileControllers.cancelFriendReq)

router.post('/acceptFriendReq', isAuth, profileControllers.acceptFriendReq)

router.post('/declineFriendReq', isAuth, profileControllers.declineFriendReq)

router.get('/getNotifications', isAuth, profileControllers.getNotifications)

router.get('/getFeedPosts', isAuth, profileControllers.getFeedPosts)

router.get('/getFeedPostsCount', isAuth, profileControllers.getFeedPostsCount)

router.get('/getOnlineFriends', isAuth, profileControllers.getOnlineFriends)

router.get('/getFriends', isAuth, profileControllers.getFriends)

router.get('/getFriendsCount', isAuth, profileControllers.getFriendsCount)

module.exports = router;
