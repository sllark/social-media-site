const mongoose = require('mongoose')
const {validationResult} = require('express-validator');

const Message = require('../model/Message');
const getChatID = require('../helper/getChatID');


exports.getMessages = async (req, res, next) => {
    //TODO: req.user.userID === req.query.from otherwise throw unauth task error

    let chatID = getChatID(req.query.to, req.query.from);
    let max = 15,
        skip = Number(req.query.msgsCount);

    let messages = await Message.find(
        {chatID: chatID}
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

    let chatID = getChatID(req.query.to, req.query.from);
    let max = await Message.countDocuments({chatID: chatID});

    res.status(200).json({
        "message": "success",
        max: max
    });

}
