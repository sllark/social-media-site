const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const Message = require('../model/Message');
const getChatID = require('../helper/getChatID');


exports.getMessages = async (req, res, next) => {

    if (req.user.userID.toString() !== req.query.from.toString()){
        const error = new Error("Unauthorized to get messages.");
        error.statusCode = 401;
        return next(error);
    }

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

    if (req.user.userID.toString() !== req.query.from.toString()){
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
