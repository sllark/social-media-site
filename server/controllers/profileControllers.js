const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const User = require('../model/User');
const Post = require('../model/Post');
const Notification = require('../model/Notification');



exports.getUser = async (req, res, next) => {
    //TODO: check if req.query.profileID is valid id

    let userID = req.user.userID

    let user = await User.findById(req.query.profileID)
        .select("firstName lastName profilePicture coverPicture bio dob gender friends friendRequests isOnline")


    user = await user.populate({
        path: 'notifications',
        model: 'Notification',
    }).execPopulate()


    let updatedUser = {...user._doc};

    let myFriendIndex = updatedUser.friends.findIndex(id => id.toString() === userID.toString()),
        friendReqIndex = updatedUser.friendRequests.findIndex(id => id.toString() === userID.toString());


    delete updatedUser.friendRequests;
    delete updatedUser.friends;

    updatedUser.isMyFriend = myFriendIndex >= 0;
    updatedUser.reqSent = friendReqIndex >= 0;


    res.status(200).json({
        "message": "success",
        user: updatedUser
    });
}

exports.getSearchUsers = async (req, res, next) => {
    //TODO: check if req.query.profileID is valid id

    let query = req.query.queryString,
        userLoaded = Number(req.query.userLoaded) || 0

    // let user = await User.find({$text: {$search: `${query}`}}).sort( { score: { $meta: "textScore" } } )

    User.search(query,userLoaded, function(err, data) {

        res.status(200).json({
            "message": "success",
            users:data
        });
    })

}


exports.getProfileDetails = async (req, res, next) => {

    //TODO: validate req.query.profileID

    let user = await User.findById(req.query.profileID)
        .select("firstName lastName profilePicture")

    res.status(200).json({
        "message": "success",
        user
    });
}


exports.updateProfilePic = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return  next(error);
    }

    let postImage = "";
    if (req.file) postImage = req.file.filename

    if (!postImage)
        res.status(500).json({
            "message": "failed",
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
        select: "firstName lastName profilePicture"
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

    let postImage = "";
    if (req.file) postImage = req.file.filename

    if (!postImage)
        res.status(500).json({
            "message": "failed",
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
        select: "firstName lastName profilePicture"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
        coverPicture: postImage,
        post: newPost
    });

}


exports.addBio = async (req, res, next) => {

    //TODO: req.body.bio !==""

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let bio = req.body.bio;


    let user = await User.findById(req.user.userID)
    user.bio = bio;
    await user.save();

    res.status(200).json({
        "message": "success 122",
        bio: user.bio,
    });

}


exports.sendFriendReq = async (req, res, next) => {
    //TODO: check if req.body.userID is valid id

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

    myUser = await User.findById(req.user.userID)

    let reqSentIndex = myUser.friendRequestsSent.findIndex(id => otherUserId === id);

    if (reqSentIndex >= 0) {
        res.status(200).json({
            "message": "failed",
            "errorMessage": "Request already sent",
        });
        return
    }

    otherUser = await User.findById(otherUserId)
    otherUser.friendRequests.push(req.user.userID);
    await otherUser.save()
    myUser.friendRequestsSent.push(otherUserId);
    await myUser.save()


    let notification = new Notification({
        person: req.user.userID,
        notificationType: 'req',
        content: `${myUser.firstName} ${myUser.lastName} sent your a friend request.`,
        notificationPostID: req.user.userID,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    otherUser.notifications.splice(0, 0, notification._id);
    await otherUser.save();

    res.status(200).json({
        "message": "success",
    });


}


exports.cancelFriendReq = async (req, res, next) => {
    //TODO: check if req.body.userID is valid id

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

    myUser = await User.findById(req.user.userID)

    reqSentIndex = myUser.friendRequestsSent.findIndex(id => otherUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        res.status(500).json({
            "message": "failed",
            "errorMessage": "No Request to cancel",
        });
        return
    }

    otherUser = await User.findById(otherUserId)

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


}


exports.acceptFriendReq = async (req, res, next) => {

    //TODO: add notification to the user whom request is accepted
    //TODO: validate req.body.userID


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

    myUser = await User.findById(req.user.userID)
    otherUser = await User.findById(otherUserId)

    reqIndex = myUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    reqSentIndex = otherUser.friendRequestsSent.findIndex(id => myUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        res.status(500).json({
            "message": "failed",
            "errorMessage": "You have no friend request to accept"
        });
        return
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


}


exports.declineFriendReq = async (req, res, next) => {

    //TODO: validate req.body.userID

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

    myUser = await User.findById(req.user.userID)
    otherUser = await User.findById(otherUserId)

    reqIndex = myUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    reqSentIndex = otherUser.friendRequestsSent.findIndex(id => myUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        res.status(200).json({
            "message": "failed",
            "errorMessage": "You have no friend request to decline.",
        });
        return
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


}


exports.getNotifications = async (req, res, next) => {

    let userID = req.user.userID

    let user = await User.findById(userID).select('notifications')
    // .select("firstName lastName profilePicture coverPicture bio dob gender friends friendRequests")


    user = await user.populate({
        path: 'notifications',
        model: 'Notification',
    }).execPopulate()

    user = await user.populate({
        path: 'notifications.person',
        model: 'User',
        select: ['profilePicture']
    }).execPopulate()


    res.status(200).json({
        "message": "success",
        notifications: user.notifications
    });
}


exports.getFeedPosts = async (req, res, next) => {


    let max = 5,
        skip = Number(req.query.postsLoaded);

    let user = await User.findById(req.user.userID)
    let posts = await Post.find(
        {
            $or: [{user: {$in: user.friends}}, {user: user._id}]
        }
    )
        .sort({_id: -1})
        .limit(max)
        .skip(skip)
        .populate('user', 'firstName lastName profilePicture')
        .populate({
            path: 'comments.by',
            model: 'CommentBy',
            populate: {
                path: 'person',
                select: 'firstName lastName profilePicture',
                model: 'User'
            }
        })
        .populate({
            path: 'sharedFrom',
            model: 'User',
            select: 'firstName lastName profilePicture'
        })

    let likeIndex = -1;
    posts.forEach(post => {
        likeIndex = -1;
        likeIndex = post.likes.by.findIndex(id => id.toString() === req.user.userID.toString())
        post.likes.likedByMe = likeIndex >= 0
    })


    res.status(200).json({
        "message": "success",
        posts: posts,
    });

}

exports.getFeedPostsCount = async (req, res, next) => {


    let user = await User.findById(req.user.userID)
    let maxPost = await Post.countDocuments({
        $or: [{user: {$in: user.friends}}, {user: user._id}]
    })

    res.status(200).json({
        "message": "success",
        max: maxPost
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

    let {userID} = req.user;
    let skip = 0;
    if (req.query.loadedFriends) skip = Number(req.query.loadedFriends);

    let userFiends = await User.findById(userID)
        .select("friends")
        .populate({
            path: 'friends',
            options: {
                limit: 20,
                skip:skip
            },
            select: "firstName lastName profilePicture bio gender",
            model: "User"
        })


    res.status(200).json({
        "message": "success",
        friends: userFiends.friends
    });

}


exports.getFriendsCount = async (req, res, next) => {

    let {userID} = req.user;

    let userFiends = await User.findById(userID)
        .select("friends")


    res.status(200).json({
        "message": "success",
        friendsCount: userFiends.friends.length
    });

}
