const express = require('express');
const {body, check} = require('express-validator')
const asyncHandler = require('express-async-handler')


const {isAuth} = require('../helper/isAuth')
const validateObjectID = require('../helper/validateObjectID')
const profileControllers = require('../controllers/profileControllers')

const router = express.Router();


router.get('/getUser', isAuth, validateObjectID("profileID"), asyncHandler(profileControllers.getUser))

router.get('/getSearchUsers', isAuth, [check('queryString').notEmpty()], asyncHandler(profileControllers.getSearchUsers))

router.get('/getProfileDetails', isAuth, validateObjectID("profileID"), asyncHandler(profileControllers.getProfileDetails))

router.post('/updateProfilePic', isAuth, asyncHandler(profileControllers.updateProfilePic))

router.post('/updateCoverPic', isAuth, asyncHandler(profileControllers.updateCoverPic))

router.post('/addBio', isAuth, [body('bio').notEmpty()], asyncHandler(profileControllers.addBio))

router.post('/sendFriendReq', isAuth, validateObjectID("userID"),
    [body("userID").custom((id, {req}) => {
        if (id === req.user.userID.toString())
            throw new Error('You cannot send Friend Request to yourself.');
        else
            return true;
    })],
    asyncHandler(profileControllers.sendFriendReq))

router.post('/cancelFriendReq', isAuth, validateObjectID("userID"), asyncHandler(profileControllers.cancelFriendReq))

router.post('/acceptFriendReq', isAuth, validateObjectID("userID"), asyncHandler(profileControllers.acceptFriendReq))

router.post('/declineFriendReq', isAuth, validateObjectID("userID"), asyncHandler(profileControllers.declineFriendReq))

router.post('/unfriend', isAuth, validateObjectID("userID"), asyncHandler(profileControllers.unfriend))

router.get('/getNotifications', isAuth, asyncHandler(profileControllers.getNotifications))

router.get('/getTotalNotifications', isAuth, asyncHandler(profileControllers.getTotalNotifications))

router.get('/updateUnreadNotifications', isAuth, asyncHandler(profileControllers.updateUnreadNotifications))

router.get('/getOnlineFriends', isAuth, asyncHandler(profileControllers.getOnlineFriends))

router.get('/getFriends', isAuth, validateObjectID("profileID"), asyncHandler(profileControllers.getFriends))

router.get('/getFriendsCount', isAuth, validateObjectID("profileID"), asyncHandler(profileControllers.getFriendsCount))


module.exports = router;