const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const Message = require('../model/Message');
const User = require('../model/User');
const getChatID = require('../helper/getChatID');


exports.getMessages = async (req, res, next) => {

    if (req.user.userID.toString() !== req.query.from.toString()) {
        const error = new Error("Unauthorized to get messages.");
        error.statusCode = 401;
        return next(error);
    }

    // await Message.updateMany({},{"$set":{"isRead":true}},{ multi: true })


    let chatID = getChatID(req.query.to, req.query.from);
    let max = 15,
        skip = Number(req.query.msgsCount);

    let messages = await Message.find(
        {chatID: chatID}
    )
        .sort({_id: -1})
        .limit(max)
        .skip(skip)

    res.status(200).json({
        "message": "success",
        messages: messages
    });

}

exports.getMessagesCount = async (req, res, next) => {

    if (req.user.userID.toString() !== req.query.from.toString()) {
        const error = new Error("Unauthorized to get messages count.");
        error.statusCode = 401;
        return next(error);
    }

    let chatID = getChatID(req.query.to, req.query.from);
    let max = await Message.countDocuments({chatID: chatID});

    res.status(200).json({
        "message": "success",
        max: max
    });

}

exports.getChats = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.user.userID,
        loaded = req.query.loaded || 0,
        max = loaded === 0 ? 25 : 10;


    let userChats = await User.findById(userID).select("conersationWith")


    userChats = await userChats.populate({
        path: 'conersationWith',
        model: 'User',
        options: {
            // sort: {_id: -1},
            skip: Number(loaded),
            limit: max
        },
        select: "firstName lastName profilePicture isOnline"
    }).execPopulate()


    let chats = []

    for (let item of userChats.conersationWith) {
        item = item.toObject()
        let chatID = getChatID(userID, item._id)
        item.unRead = await Message.find({chatID: chatID, isRead: false, to: userID}).count();
        let lastMessage = await Message.findOne({chatID: chatID}).sort({_id: -1}).select('value');
        item.lastMessage = lastMessage.value;
        chats.push(item)
    }


    res.status(200).json({
        "message": "success",
        chats: chats
    });

}

exports.getTotalChats = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.user.userID;


    let conversations = await User.aggregate()
        .match({_id: mongoose.Types.ObjectId(userID)})
        .project({conersationWith: {$size: '$conersationWith'}})

    let total = conversations[0].conersationWith

    res.status(200).json({
        "message": "success",
        total: total || 0,
    });

}

exports.updateUnreadChat = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.user.userID,
        otherUser = req.body.userID;

    let chatID = getChatID(userID, otherUser);

    let result = await Message.updateMany({
        chatID: chatID,
        isRead: false,
        to: userID
    }, {"$set": {"isRead": true}}, {multi: true})



    res.status(200).json({
        "message": "success",
    });

}

exports.getUnreadMessages = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.user.userID;


    let unreadMessage = await Message.find({
        to: userID,
        isRead: false
    }).count();

    res.status(200).json({
        "message": "success",
        unread: unreadMessage
    });

}


exports.getLatestChatID = async (req, res, next) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        let errors = validation.array()
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.errors = errors;
        return next(error);
    }

    let userID = req.user.userID;

    let userChats = await User.findById(userID).select("conersationWith").lean()

    res.status(200).json({
        "message": "success",
        id: userChats.conersationWith[0]
    });

}
