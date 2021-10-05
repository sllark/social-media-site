const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const User = require('../model/User');
const Post = require('../model/Post');
const Notification = require('../model/Notification');

const {getIO} = require('../helper/socket')


exports.getUser = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let userID = req.user.userID

    let user = await User.findById(req.query.profileID)
        .select("firstName lastName profilePicture coverPicture bio dob gender friends friendRequests friendRequestsSent isOnline")


    user = await user.populate({
        path: 'notifications',
        model: 'Notification',
    }).execPopulate()


    let updatedUser = {...user._doc};

    let myFriendIndex = updatedUser.friends.findIndex(id => id.toString() === userID.toString()),
        friendReqIndex = updatedUser.friendRequests.findIndex(id => id.toString() === userID.toString()),
        friendReqRecievedIndex = updatedUser.friendRequestsSent.findIndex(id => id.toString() === userID.toString())

    delete updatedUser.friendRequests;
    delete updatedUser.friendRequestsSent;
    delete updatedUser.friends;

    updatedUser.isMyFriend = myFriendIndex >= 0;
    updatedUser.reqSent = friendReqIndex >= 0;
    updatedUser.reqRecieved = friendReqRecievedIndex >= 0;


    res.status(200).json({
        "message": "success",
        user: updatedUser
    });
}

exports.getSearchUsers = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let query = req.query.queryString,
        userLoaded = Number(req.query.userLoaded) || 0

    // let user = await User.find({$text: {$search: `${query}`}}).sort( { score: { $meta: "textScore" } } )

    User.search(query, userLoaded, function (err, data) {

        if (err) return next(err);

        res.status(200).json({
            "message": "success",
            users: data
        });
    })

}


exports.getProfileDetails = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let user = await User.findById(req.query.profileID)
        .select("firstName lastName profilePicture isOnline")

    res.status(200).json({
        "message": "success",
        user
    });
}


exports.updateProfilePic = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let postImage = req.body.fileUrl || '';

    if (!postImage)
        return res.status(404).json({
            "message": "Image not found",
        });

    let user = await User.findById(req.user.userID)
    user.profilePicture = postImage;

    let newPost = new Post({
        postText: `${user.firstName} ${user.lastName} updated Profile Picture.`,
        postImage,
        user: req.user.userID,
        likes: {
            count: 0,
            by: []
        },
        comments: {
            count: 0,
            by: []
        }
    })

    user.posts.push(newPost._id);
    await user.save();
    await newPost.save()

    await newPost.populate({
        path: 'user',
        model: 'User',
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
        profilePicture: postImage,
        post: newPost
    });

}


exports.updateCoverPic = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let postImage = req.body.fileUrl || '';

    if (!postImage)
        return res.status(404).json({
            "message": "Image not found",
        });

    let user = await User.findById(req.user.userID)
    user.coverPicture = postImage;


    let newPost = new Post({
        postText: `${user.firstName} ${user.lastName} updated Cover Picture.`,
        postImage,
        user: req.user.userID,
        likes: {
            count: 0,
            by: []
        },
        comments: {
            count: 0,
            by: []
        }
    })


    user.posts.push(newPost._id);
    await user.save();

    await newPost.save()

    await newPost.populate({
        path: 'user',
        model: 'User',
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
        coverPicture: postImage,
        post: newPost
    });

}


exports.addBio = async (req, res, next) => {


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let bio = req.body.bio;


    let user = await User.findById(req.user.userID).select("bio")
    user.bio = bio;
    await user.save();

    res.status(200).json({
        "message": "success",
        bio: user.bio,
    });

}


exports.sendFriendReq = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let otherUserId = req.body.userID;

    let myUser, otherUser;

    myUser = await User.findById(req.user.userID).select('friendRequestsSent firstName lastName')

    let reqSentIndex = myUser.friendRequestsSent.findIndex(id => otherUserId === id);

    if (reqSentIndex >= 0) {
        return res.status(200).json({
            "message": "failed",
            "errorMessage": "Request already sent",
        });
    }

    otherUser = await User.findById(otherUserId).select('friendRequests notifications')
    otherUser.friendRequests.push(req.user.userID);
    await otherUser.save()
    myUser.friendRequestsSent.push(otherUserId);
    await myUser.save()


    let notification = new Notification({
        userID: otherUserId,
        person: req.user.userID,
        notificationType: 'req',
        content: `${myUser.firstName} ${myUser.lastName} sent your a friend request.`,
        notificationPostID: req.user.userID,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    otherUser.notifications.splice(0, 0, notification._id);
    await otherUser.save();


    await notification.populate({
        path: 'person',
        model: 'User',
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
    });


    let io = getIO();
    io.in(otherUserId.toString()).emit('req', {notification})


}


exports.cancelFriendReq = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let otherUserId = req.body.userID;

    let myUser, otherUser, reqSentIndex;

    myUser = await User.findById(req.user.userID).select('friendRequestsSent')

    reqSentIndex = myUser.friendRequestsSent.findIndex(id => otherUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        return res.status(404).json({
            "message": "failed",
            "errorMessage": "No Request to cancel",
        });
    }

    otherUser = await User.findById(otherUserId).select('friendRequests friends notifications')

    let reqIndex = otherUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    otherUser.friendRequests.splice(reqIndex, 1);
    myUser.friendRequestsSent.splice(reqSentIndex, 1);


    //removing notification of the like
    let notifi = await Notification.findOne({
        notificationType: "req",
        person: req.user.userID,
        notificationPostID: req.user.userID
    })

    let notificationIndex = otherUser.notifications.findIndex(id => id.toString() === notifi._id.toString())

    otherUser.notifications.splice(notificationIndex, 1);


    await Notification.findByIdAndDelete({_id: notifi._id});


    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
    });


    let io = getIO();
    io.in(otherUserId.toString()).emit('reqCancel', {notification: notifi})

}


exports.acceptFriendReq = async (req, res, next) => {

    //TODO: add notification to the user whose request is accepted


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let otherUserId = req.body.userID,
        myUserId = req.user.userID;

    let myUser, otherUser, reqSentIndex, reqIndex;

    myUser = await User.findById(req.user.userID).select('friendRequests friends notifications')
    otherUser = await User.findById(otherUserId).select('friendRequestsSent friends')

    reqIndex = myUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    reqSentIndex = otherUser.friendRequestsSent.findIndex(id => myUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        return res.status(404).json({
            "message": "failed",
            "errorMessage": "No friend request of the user to accept."
        });
    }

    myUser.friendRequests.splice(reqIndex, 1);
    otherUser.friendRequestsSent.splice(reqIndex, 1);

    myUser.friends.splice(0, 0, otherUserId);
    otherUser.friends.splice(0, 0, myUserId)

    //removing notification of the req
    let notifi = await Notification.findOne({
        notificationType: "req",
        person: otherUserId,
        notificationPostID: otherUserId
    })

    let notificationIndex = myUser.notifications.findIndex(id => id.toString() === notifi._id.toString())

    myUser.notifications.splice(notificationIndex, 1);


    await Notification.findByIdAndDelete({_id: notifi._id});


    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
    });

    let io = getIO();
    io.in(otherUserId.toString()).emit('reqAccepted', {notification: notifi})

}


exports.declineFriendReq = async (req, res, next) => {


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let otherUserId = req.body.userID, //person who sent request
        myUserId = req.user.userID;

    let myUser, otherUser, reqSentIndex, reqIndex;

    myUser = await User.findById(req.user.userID).select('friendRequests notifications')
    otherUser = await User.findById(otherUserId).select('friendRequestsSent')

    reqIndex = myUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    reqSentIndex = otherUser.friendRequestsSent.findIndex(id => myUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        return res.status(200).json({
            "message": "failed",
            "errorMessage": "No friend request of user to decline.",
        });

    }

    myUser.friendRequests.splice(reqIndex, 1);
    otherUser.friendRequestsSent.splice(reqIndex, 1);


    //removing notification of the req
    let notifi = await Notification.findOne({
        notificationType: "req",
        person: otherUserId,
        notificationPostID: otherUserId
    })

    let notificationIndex = myUser.notifications.findIndex(id => id.toString() === notifi._id.toString())

    myUser.notifications.splice(notificationIndex, 1);


    await Notification.findByIdAndDelete({_id: notifi._id});


    // TODO: add notification that myUser declined the request

    //saving both users
    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
        "isDeclined": true
    });

    let io = getIO();
    io.in(otherUserId.toString()).emit('reqDeclined', {notification: notifi})

}


exports.unfriend = async (req, res, next) => {


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userToUnfriend = req.body.userID, //person who sent request
        myUserId = req.user.userID;

    let myUser, otherUser, otherUserFrndMyIndex, friendIndex;

    myUser = await User.findById(req.user.userID).select('friends')
    otherUser = await User.findById(userToUnfriend).select('friends')

    friendIndex = myUser.friends.findIndex(id => userToUnfriend.toString() === id.toString());

    if (friendIndex < 0) {
        return res.status(401).json({
            "message": "failed",
            "errorMessage": "User not found in your friends list.",
        });
    }

    otherUserFrndMyIndex = otherUser.friends.findIndex(id => myUserId.toString() === id.toString());

    myUser.friends.splice(friendIndex, 1);
    otherUser.friends.splice(otherUserFrndMyIndex, 1);

    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
        "unfriend": true
    });


    let io = getIO();
    io.in(userToUnfriend).emit('unfriend', {notification: {}})

}


exports.getNotifications = async (req, res, next) => {

    let userID = req.user.userID
    let max = 12,
        skip = Number(req.query.loaded) || 0;

    // await Notification.updateMany({},{"$set":{"isRead":false}},{ multi: true })
    // await Notification.deleteMany({})


    let user = await User.findById(userID)
        .select('notifications')
        .populate({
            path: 'notifications',
            options: {
                sort: {_id: -1},
                skip: skip,
                limit: max
            },
            model: 'Notification',
            populate: {
                path: 'person',
                model: 'User',
                select: 'profilePicture'
            }
        })


    // user.notifications=[];
    // await user.save();


    res.status(200).json({
        "message": "success",
        notifications: user.notifications
    });
}

exports.getTotalNotifications = async (req, res, next) => {

    let userID = req.user.userID


    let notifications = await User.aggregate()
        .match({_id: mongoose.Types.ObjectId(userID)})
        .project({notifications: {$size: '$notifications'}})

    let total = notifications[0].notifications;


    let unread = await Notification.find({
        userID: userID,
        isRead: false
    }).count();


    // let notifications = await User.findById('userID').select('notifications');
    // let total = notifications.length;


    res.status(200).json({
        "message": "success",
        total: total || 0,
        unread: unread
    });
}


exports.updateUnreadNotifications = async (req, res, next) => {

    let userID = req.user.userID,
        max = req.query.loaded;



    await Notification.updateMany(
        {
            userID: userID,
        },
        {
            "$set": {"isRead": true}
        },
        {
            multi: true,
            sort: {_id: -1},
            limit: max
        }
    )


    res.status(200).json({
        "message": "success"
    });
}


exports.getOnlineFriends = async (req, res, next) => {

    let {userID} = req.user;

    let userFiends = await User.findById(userID)
        .select("friends")
        .populate({
            path: 'friends',
            options: {
                limit: 50,
            },
            match: {isOnline: true},
            select: "firstName lastName profilePicture",
            model: "User"
        })


    res.status(200).json({
        "message": "success",
        friends: userFiends.friends
    });

}


exports.getFriends = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.query.profileID;
    let skip = 0;
    if (req.query.loadedFriends) skip = Number(req.query.loadedFriends);

    let userFiends = await User.findById(userID)
        .select("friends")
        .populate({
            path: 'friends',
            options: {
                limit: 20,
                skip: skip
            },
            select: "firstName lastName profilePicture bio gender isOnline",
            model: "User"
        })


    res.status(200).json({
        "message": "success",
        friends: userFiends.friends
    });

}


exports.getFriendsCount = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.query.profileID;

    let userFiends = await User.findById(userID)
        .select("friends")


    res.status(200).json({
        "message": "success",
        friendsCount: userFiends.friends.length
    });

}


