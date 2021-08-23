const mongoose = require('mongoose')
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/User');
const Post = require('../model/Post');
const CommentBy = require('../model/CommentBy');
const Notification = require('../model/Notification');
const Message = require('../model/Message');


const getChatID = require('../helper/getChatID');


exports.createPost = (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let postImage = "";
    if (req.file) postImage = req.file.filename

    let newPost = new Post({
        postText: req.body.postText,
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


    let saved;

    newPost.save()
        .then(savedPost => {
            saved = savedPost;

            return User.findById(req.user.userID);
        })
        .then(user => {
            user.posts.push(saved._id);
            return user.save();

        })
        .then(user => {

            return saved.populate({
                path: 'user',
                model: 'User'
            }).execPopulate();

        })

        .then(post => {

            res.status(200).json({
                "message": "success",
                post: post
            });

        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        })


}


exports.deletePost = (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        console.log(errors);
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;

    }

    let postID = req.body.postID;


    Post.findById(postID)
        .then(post => {

            if (post.user.toString() === req.user.userID.toString()) {

                User.findById(post.user)
                    .then(user => {
                        let index = user.posts.findIndex((post) => post.toString() === postID.toString())

                        user.posts.splice(index, 1)
                        return user.save()
                    })
                    .then(user => {
                        return post.delete()
                    })
                    .then(query => {
                        res.status(200).json({
                            "message": "success",
                        });
                    })
                    .catch(err => {
                        if (!err.statusCode)
                            err.statusCode = 500;
                        next(err);
                    })

            } else {

                res.status(500).json({
                    "message": "failed",
                });

            }
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        })


}


exports.getPosts = async (req, res, next) => {


    let max = 5,
        skip = ((Number(req.query.pageNum) - 1) * max),
        maxPost = 0;


    let user = await User.findById(req.query.profileID)
    maxPost = user.posts.length

    user = await user.populate({
        path: 'posts',
        options: {
            sort: {_id: -1},
            skip: skip,
            limit: max
        },
        populate: {
            path: 'user', //posts.user
            model: 'User',
            select: 'firstName lastName profilePicture'
        }
    }).execPopulate()

    user = await user.populate({
        path: 'posts.comments.by',
        model: 'CommentBy',
        populate: {
            path: 'person',
            model: 'User',
            select: 'firstName lastName profilePicture'
        }
    }).execPopulate()


    let posts = user.posts;

    let likeIndex = -1;
    posts.forEach(post => {
        likeIndex = -1;
        likeIndex = post.likes.by.findIndex(id => id.toString() === req.user.userID.toString())
        post.likes.likedByMe = likeIndex >= 0
    })


    res.status(200).json({
        "message": "success",
        posts: posts,
        max: maxPost
    });

}


exports.getUser = async (req, res, next) => {

    let userID = req.user.userID

    let user = await User.findById(req.query.profileID)
    // .select("firstName lastName profilePicture coverPicture bio dob gender friends friendRequests")


    user = await user.populate({
        path: 'notifications',
        model: 'Notification',
    }).execPopulate()


    let updatedUser = {...user._doc};

    let myFriendIndex = updatedUser.friends.findIndex(id => id.toString() === userID.toString()),
        friendReqIndex = updatedUser.friendRequests.findIndex(id => id.toString() === userID.toString());


    // delete updatedUser.password;
    // delete updatedUser.posts;
    // delete updatedUser.email;
    // delete updatedUser.friendRequests;
    // delete updatedUser.friendRequestsSent;
    // delete updatedUser.friends;

    updatedUser.isMyFriend = myFriendIndex >= 0;
    updatedUser.reqSent = friendReqIndex >= 0;


    // updatedUser = await updatedUser.populate({
    //     path: 'posts.comments.by.person',
    //     model: 'User',
    //     select: {'firstName':1, 'lastName':1}
    // }).execPopulate()
    //

    res.status(200).json({
        "message": "success",
        user: updatedUser
    });
}


exports.likePost = async (req, res, next) => {

    let postID = req.body.postID,
        userID = req.user.userID,
        postAuthor = null,
        myUser = null,
        originalPost = null;

    originalPost = await Post.findById(postID)

    let myIndex = originalPost.likes.by.findIndex(id => id.toString() === userID.toString())

    if (myIndex >= 0) {
        originalPost.likes.count -= 1;
        originalPost.likes.by.splice(myIndex, 1);
        originalPost.markModified('likes');

        await originalPost.save()

        if (userID.toString() !== originalPost.user.toString()) {

            postAuthor = await User.findById(originalPost.user).exec()

            let notifi = await Notification.findOne({
                notificationType: "like",
                person: userID,
                notificationPostID: originalPost._id
            })

            let notificationIndex = postAuthor.notifications.findIndex(id => id.toString() === notifi._id.toString())

            postAuthor.notifications.splice(notificationIndex, 1);
            await postAuthor.save();

            await Notification.findByIdAndDelete({_id: notifi._id});


        }


        return res.status(200).json({
            "message": "success"
        });

    }

    originalPost.likes.count += 1;
    originalPost.likes.by.push(userID);
    originalPost.markModified('likes');

    await originalPost.save()

    if (userID.toString() === originalPost.user.toString()) {

        return res.status(200).json({
            "message": "success"
        });

    }


    postAuthor = await User.findById(originalPost.user)
    myUser = await User.findById(userID).select('firstName lastName')

    let notification = new Notification({
        person: req.user.userID,
        notificationType: 'like',
        content: `${myUser.firstName} ${myUser.lastName} Liked your post.`,
        notificationPostID: originalPost._id,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    postAuthor.notifications.splice(0, 0, notification._id);
    await postAuthor.save();

    res.status(200).json({
        "message": "success"
    });

}


exports.commentPost = async (req, res, next) => {

    let postID = req.body.postID,
        commentValue = req.body.value;
    let userID = req.user.userID;
    let newComment, fetchedPost, postAuthor, myUser;


    newComment = new CommentBy({
        person: userID,
        postID: postID,
        content: commentValue,
        likes: {
            count: 0,
            by: []
        },
        date: Date.now()
    });
    await newComment.save()


    fetchedPost = await Post.findById(postID)

    fetchedPost.comments.count += 1;
    fetchedPost.comments.by.splice(0, 0, newComment._id);
    fetchedPost.markModified('comments');
    await fetchedPost.save()


    if (userID.toString() === fetchedPost.user.toString()) {

        // populate comment with person data
        await newComment.populate({
            path: 'person',
            model: 'User',
            select: ['firstName', 'lastName']
        }).execPopulate()

        return res.status(200).json({
            "message": "success",
            comment: newComment
        })


    }


    postAuthor = await User.findById(fetchedPost.user)
    myUser = await User.findById(userID).select('firstName lastName')

    // add notification
    let notification = new Notification({
        person: userID,
        notificationType: 'comment',
        content: `${myUser.firstName} ${myUser.lastName} commented on your post.`,
        notificationPostID: fetchedPost._id,
        date: Date.now()
    })
    await notification.save()

    postAuthor.notifications.splice(0, 0, notification._id);
    await postAuthor.save()


    // populate comment with person data
    await newComment.populate({
        path: 'person',
        model: 'User',
        select: ['firstName', 'lastName']
    }).execPopulate()

 res.status(200).json({
        "message": "success",
        comment: newComment
    })

}


exports.likeComment = async (req, res, next) => {

    let {commentID} = req.body;
    let userID = req.user.userID, comment, commentAuthor, myUser;


    comment = await CommentBy.findById(commentID).exec()
    commentAuthor = await User.findById(comment.person).exec()

    let myIndex = comment.likes.by.findIndex(id => id.toString() === userID.toString())

    //remove the like from comment if already liked
    if (myIndex >= 0) {

        comment.likes.count -= 1;
        comment.likes.by.splice(myIndex, 1);

        comment.markModified('comments');
        await comment.save();

        if (userID.toString() !== comment.person.toString()) {

            //removing notification of the like
            let notifi = await Notification.findOne({
                notificationType: "commentLike",
                person: userID,
                notificationPostID: comment.postID
            })

            let notificationIndex = commentAuthor.notifications.findIndex(id => id.toString() === notifi._id.toString())

            commentAuthor.notifications.splice(notificationIndex, 1);
            await commentAuthor.save();

            await Notification.findByIdAndDelete({_id: notifi._id});

        }


        return res.status(200).json({
            "message": "success",
            commentLikes: comment.likes

        });

    }


    comment.likes.count += 1;
    comment.likes.by.push(userID);

    comment.markModified('comments');
    await comment.save();


    // no notification needed if user liked its own comment
    if (userID.toString() === comment.person.toString()) {

        return res.status(200).json({
            "message": "success",
            commentLikes: comment.likes

        });

    }


    //adding notification for the event
    myUser = await User.findById(userID).select('firstName lastName')

    let notification = new Notification({
        person: userID,
        notificationType: 'commentLike',
        content: `${myUser.firstName} ${myUser.lastName} Liked your comment.`,
        notificationPostID: comment.postID,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    commentAuthor.notifications.splice(0, 0, notification._id);
    await commentAuthor.save();

    res.status(200).json({
        "message": "success",
        commentLikes: comment.likes
    });

}


exports.getProfileDetails = async (req, res, next) => {

    let user = await User.findById(req.query.profileID)
    .select("firstName lastName profilePicture")

    res.status(200).json({
        "message": "success",
        user
    });
}


exports.updateProfilePic = (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let postImage = "";
    if (req.file) postImage = req.file.filename

    if (!postImage)
        res.status(500).json({
            "message": "failed",
        });

    User.findById(req.user.userID)
        .then(user => {
            user.profilePicture = postImage;
            return user.save();
        })
        .then(user => {

            res.status(200).json({
                "message": "success",
                profilePicture: postImage
            });

        })

}


exports.updateCoverPic = (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let postImage = "";
    if (req.file) postImage = req.file.filename

    if (!postImage)
        res.status(500).json({
            "message": "failed",
        });

    User.findById(req.user.userID)
        .then(user => {
            user.coverPicture = postImage;
            return user.save();
        })
        .then(user => {

            res.status(200).json({
                "message": "success",
                coverPicture: postImage
            });

        })

}


exports.addBio = (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    console.log(req);
    let bio = req.body.bio;

    console.log(req.body);
    console.log(bio);


    User.findById(req.user.userID)
        .then(user => {
            user.bio = bio;
            return user.save();
        })
        .then(user => {
            console.log(user);


            res.status(200).json({
                "message": "success 122",
                bio: user.bio,
            });

        })

}


exports.sendFriendReq = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
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

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let otherUserId = req.body.userID;

    let myUser, otherUser, reqSentIndex;

    myUser = await User.findById(req.user.userID)

    reqSentIndex = myUser.friendRequestsSent.findIndex(id => otherUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        res.status(200).json({
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


    //saving both users
    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
    });


}


exports.acceptFriendReq = async (req, res, next) => {

    //TODO: add notification to the user whom request is accepted


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let otherUserId = req.body.userID,
        myUserId = req.user.userID;

    let myUser, otherUser, reqSentIndex, reqIndex;

    myUser = await User.findById(req.user.userID)
    otherUser = await User.findById(otherUserId)

    reqIndex = myUser.friendRequests.findIndex(id => otherUserId.toString() === id.toString());
    reqSentIndex = otherUser.friendRequestsSent.findIndex(id => myUserId.toString() === id.toString());

    if (reqSentIndex < 0) {
        res.status(200).json({
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


    //saving both users
    await otherUser.save();
    await myUser.save()


    res.status(200).json({
        "message": "success",
    });


}


exports.declineFriendReq = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
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
        skip = ((Number(req.query.pageNum) - 1) * max);

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


exports.getMessages = async (req, res, next) => {
    //TODO: req.user.userID === req.query.from otherwise throw unauth task error

    let chatID = getChatID(req.query.to,req.query.from);
    let max = 15,
        skip = Number(req.query.msgsCount);

    let messages = await Message.find(
        {chatID:chatID}
    )
        .sort({_id: -1})
        .limit(max)
        .skip(skip)


    // let user = await User.findById(req.user.userID)
    // let maxPost = await Post.countDocuments({
    //     $or: [{user: {$in: user.friends}}, {user: user._id}]
    // })

    res.status(200).json({
        "message": "success",
        messages: messages
    });

}



exports.getMessagesCount = async (req, res, next) => {

    //TODO: req.user.userID === req.query.from otherwise throw unauth task error

    let chatID = getChatID(req.query.to,req.query.from);
    let max = await Message.countDocuments({chatID:chatID});

    res.status(200).json({
        "message": "success",
        max: max
    });

}
