const mongoose = require('mongoose')
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/User');
const Post = require('../model/Post');
const CommentBy = require('../model/CommentBy');
const Notification = require('../model/Notification');
const Message = require('../model/Message');

const {redisClient, llenAsync} = require('../helper/redis')
const getChatID = require('../helper/getChatID');
const {getIO} = require('../helper/socket')
const emitSocketEvents = require('../helper/emitSocketEvents')


exports.createPost = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let postImage = req.body.fileUrl || '';

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
        },
        shares: {
            count: 0,
            by: []
        }
    })


    newPost = await newPost.save()

    let user = await User.findById(req.user.userID);
    user.posts.push(newPost._id);
    await user.save();
    await newPost.populate({
        path: 'user',
        model: 'User',
        select: "firstName lastName profilePicture"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
        post: newPost
    });


}


exports.deletePost = async (req, res, next) => {

    //TODO: delete image of the related post (make updated for shared posts images)
    //TODO: delete notifications if related post is deleted

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array();
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    let postID = req.body.postID;


    let post = await Post.findById(postID)

    if (post.user.toString() === req.user.userID.toString()) {

        let user = await User.findById(post.user)
        let index = user.posts.findIndex((post) => post.toString() === postID.toString())

        user.posts.splice(index, 1)
        await user.save()
        await post.delete()

        return res.status(200).json({
            "message": "success",
        })

    }


    res.status(500).json({
        "message": "failed",
    });

}


exports.getProfilePosts = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let max = 5,
        skip = Number(req.query.postsLoaded),
        maxPost = 0;


    let user = await User.findById(req.query.profileID)
    maxPost = user.posts.length

    user = await user
        .populate({
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
            select: 'firstName lastName profilePicture isOnline'
        }
    })
        .populate({
            path: 'posts.sharedFrom',
            model: 'User',
            select: 'firstName lastName profilePicture isOnline'
        })
        .execPopulate()

    let posts = user.posts;

    let likeIndex = -1;
    posts.forEach(post => {
        redisClient.sadd(post._id.toString(), req.user.userID.toString())
        redisClient.sadd(req.user.userID.toString() + "-posts", post._id.toString())

        post.toObject();
        likeIndex = -1;
        likeIndex = post.likes.by.findIndex(id => id.toString() === req.user.userID.toString())
        post.likes.likedByMe = likeIndex >= 0
        delete post.likes.by;
    })

    res.status(200).json({
        "message": "success",
        posts: posts,
        max: maxPost
    });

}


exports.likePost = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


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
        let notification;
        if (userID.toString() !== originalPost.user.toString()) {

            postAuthor = await User.findById(originalPost.user).exec()

            notification = await Notification.findOne({
                notificationType: "like",
                person: userID,
                notificationPostID: originalPost._id
            })


            let notificationIndex = postAuthor.notifications.findIndex(id => id.toString() === notification._id.toString())
            postAuthor.notifications.splice(notificationIndex, 1);
            await postAuthor.save();

            await Notification.findByIdAndDelete({_id: notification._id});
        }


        res.status(200).json({
            "message": "like remove success"
        });

        emitSocketEvents(originalPost.user, userID, postID, 'postUnliked', {notification})

        return;
    }

    originalPost.likes.count += 1;
    originalPost.likes.by.push(userID);
    originalPost.markModified('likes');

    await originalPost.save()

    if (userID.toString() === originalPost.user.toString()) {

        res.status(200).json({
            "message": "success"
        });

        emitSocketEvents(originalPost.user, userID, postID, 'postLiked', {notification: {}})

        return;

    }


    postAuthor = await User.findById(originalPost.user)
    myUser = await User.findById(userID).select('firstName lastName')

    let notification = new Notification({
        userID: postAuthor._id,
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

    emitSocketEvents(originalPost.user, userID, postID, 'postLiked', {notification})

}


exports.sharePost = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let postID = req.body.postID,
        userID = req.user.userID;

    let originalPost = await Post.findById(postID)

    if (originalPost.user.toString() === userID) {
        return next(new Error("Cannot share your own post."))
    }


    originalPost.shares.count += 1;
    originalPost.shares.by.splice(0, 0, userID)

    originalPost.markModified('shares');
    await originalPost.save();


    let user = await User.findById(userID)
    let postAuthor = await User.findById(originalPost.user);

    let newPost = new Post({
        user: userID,
        postText: originalPost.postText,
        postImage: originalPost.postImage,
        isShared: true,
        sharedFrom: originalPost.user,
        originalPostedTime: originalPost.createdAt,
        likes: {
            count: 0,
            by: []
        },
        comments: {
            count: 0,
            by: []
        },
        shares: {
            count: 0,
            by: []
        }
    })
    await newPost.save()

    user.posts.push(newPost._id);
    await user.save();


    let notification = new Notification({
        userID: postAuthor._id,
        person: userID,
        notificationType: 'share',
        content: `${user.firstName} ${user.lastName} shared your post.`,
        notificationPostID: originalPost._id,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    postAuthor.notifications.splice(0, 0, notification._id);
    await postAuthor.save();


    await newPost.populate({
        path: 'user',
        model: 'User',
        select: "firstName lastName profilePicture"
    }).execPopulate();


    res.status(200).json({
        "message": "success",
        post: newPost
    });

    // populate for alert
    await notification.populate({
        path: 'person',
        model: 'User',
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate();


    let io = getIO();
    io.in(postAuthor._id.toString()).emit('postShared', {notification, personData: notification.person});
}


exports.commentPost = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


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
            select: "firstName lastName profilePicture isOnline"
        }).execPopulate()

        res.status(200).json({
            "message": "success",
            comment: newComment
        })


        emitSocketEvents(fetchedPost.user, userID, postID, 'postComment', {
            comment: newComment,
            notification: {}
        })

        return;
    }


    // add notification
    postAuthor = await User.findById(fetchedPost.user)
    myUser = await User.findById(userID).select('firstName lastName')

    let notification = new Notification({
        userID: postAuthor._id,
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
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate()


    res.status(200).json({
        "message": "success",
        comment: newComment
    })


    emitSocketEvents(fetchedPost.user, userID, postID, 'postComment', {
        notification: notification,
        comment: newComment
    })

}


exports.likeComment = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let {commentID} = req.body;
    let userID = req.user.userID,
        comment, commentAuthor, myUser;


    comment = await CommentBy.findById(commentID).exec()
    commentAuthor = await User.findById(comment.person).exec()

    let myIndex = comment.likes.by.findIndex(id => id.toString() === userID.toString())

    //remove the like from comment if already liked
    if (myIndex >= 0) {

        comment.likes.count -= 1;
        comment.likes.by.splice(myIndex, 1);

        comment.markModified('comments');
        await comment.save();

        let notifi;
        // if this like is not by user on its own comment (no notification would be there in this case)
        if (userID.toString() !== comment.person.toString()) {

            //removing notification of the like
            notifi = await Notification.findOne({
                notificationType: "commentLike",
                person: userID,
                commentID: commentID,
                notificationPostID: comment.postID
            })

            let notificationIndex = commentAuthor.notifications.findIndex(id => id.toString() === notifi._id.toString())

            commentAuthor.notifications.splice(notificationIndex, 1);
            await commentAuthor.save();

            await Notification.findByIdAndDelete({_id: notifi._id});

        }


        res.status(200).json({
            "message": "success",
            commentLikes: comment.likes
        });

        emitSocketEvents(comment.person, userID, comment.postID, 'commentUnliked', {
            notification: notifi,
            commentUpdateBy: userID,
            commentID
        })

        return
    }


    comment.likes.count += 1;
    comment.likes.by.push(userID);

    comment.markModified('comments');
    await comment.save();


    // no notification needed if user liked its own comment
    if (userID.toString() === comment.person.toString()) {

        res.status(200).json({
            "message": "success",
            commentLikes: comment.likes
        });

        emitSocketEvents(comment.person, userID, comment.postID, 'commentLiked', {
            notification: {},
            commentUpdateBy: userID,
            commentID
        })
        return;
    }


    //adding notification for the event
    myUser = await User.findById(userID).select('firstName lastName')

    let notification = new Notification({
        userID: commentAuthor._id,
        person: userID,
        notificationType: 'commentLike',
        content: `${myUser.firstName} ${myUser.lastName} Liked your comment.`,
        notificationPostID: comment.postID,
        commentID: commentID,
        date: Date.now()
    })

    let notificationSaved = await notification.save()
    commentAuthor.notifications.splice(0, 0, notification._id);
    await commentAuthor.save();


    res.status(200).json({
        "message": "success",
        commentLikes: comment.likes
    });

    emitSocketEvents(comment.person, userID, comment.postID, 'commentLiked', {
        notification,
        commentUpdateBy: userID,
        commentID
    })

}


exports.getSinglePosts = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let post = await Post.findById(req.query.postID)
        .populate('user', 'firstName lastName profilePicture isOnline')
        .populate({
            path: 'comments.by',
            model: 'CommentBy',
            populate: {
                path: 'person',
                select: 'firstName lastName profilePicture isOnline',
                model: 'User'
            }
        })
        .populate({
            path: 'sharedFrom',
            model: 'User',
            select: 'firstName lastName profilePicture'
        })

    let likeIndex = -1;
    likeIndex = post.likes.by.findIndex(id => id.toString() === req.user.userID.toString())
    post.likes.likedByMe = likeIndex >= 0

    redisClient.sadd(post._id.toString(), req.user.userID.toString())
    redisClient.sadd(req.user.userID.toString() + "-posts", post._id.toString())

    res.status(200).json({
        "message": "success",
        post: post
    });

}


exports.getFeedPosts = async (req, res, next) => {

    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let max = 5,
        skip = Number(req.query.postsLoaded) || 0;

    let user = await User.findById(req.user.userID)
    let posts = await Post.find(
        {
            $or: [{user: {$in: user.friends}}, {user: user._id}]
        }
    )
        .sort({_id: -1})
        .limit(max)
        .skip(skip)
        .populate('user', 'firstName lastName profilePicture isOnline')
        .populate({
            path: 'comments.by',
            model: 'CommentBy',
            populate: {
                path: 'person',
                select: 'firstName lastName profilePicture isOnline',
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
        redisClient.sadd(post._id.toString(), req.user.userID.toString())
        redisClient.sadd(req.user.userID.toString() + "-posts", post._id.toString())

        post.toObject();
        likeIndex = -1;
        likeIndex = post.likes.by.findIndex(id => id.toString() === req.user.userID.toString())
        post.likes.likedByMe = likeIndex >= 0
        delete post.likes.by;
    })


    res.status(200).json({
        "message": "success",
        posts: posts,
    });

}


exports.getFeedPostsCount = async (req, res, next) => {


    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }


    let user = await User.findById(req.user.userID)
    let maxPost = await Post.countDocuments({
        $or: [{user: {$in: user.friends}}, {user: user._id}]
    })

    res.status(200).json({
        "message": "success",
        max: maxPost
    });

}


exports.getPostLikes = async (req, res, next) => {

    let max = 15,
        skip = Number(req.query.likesLoaded) || 0;


    let user = await Post.findById(req.query.postID)
        .select('likes')
        .populate({
            path: 'likes.by',
            options: {
                sort: {_id: -1},
                skip: skip,
                limit: max
            },
            model: 'User',
            select: 'firstName lastName profilePicture isOnline'
        })

    res.status(200).json({
        "message": "success",
        likes: user.likes.by
    });

}
