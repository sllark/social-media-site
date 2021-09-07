const User = require('../model/User')

const {getIO} = require('./socket')
const {redisClient, llenAsync, smembersAsync} = require('./redis')


const emitSocketEvents = async (postAuthor, myUserID, postID, eventType, payload) => {

    //postAuthor
    //myUserID :- user who caused the event
    //postID :- post ID to get list of all users from redis who fetched this post
    //eventType
    //payload


    //
    // await notification.populate({
    //     path: 'person',
    //     model: 'User',
    //     select: "firstName lastName profilePicture isOnline"
    // }).execPopulate();


    let personData = await User.findById(myUserID).select("firstName lastName profilePicture isOnline");


    let io = getIO();

    let data = {
        ...payload,
        personData,
        postID
    };

    // users who fetched the post
    let users = await smembersAsync(postID.toString());

    users.forEach(item => {
        if (item.toString() !== myUserID.toString()) {

            data = {
                ...payload,
                personData,
                postID
            }

            if (item.toString() !== postAuthor.toString()) delete data.notification

            io.in(item).emit(eventType, data);
        }

    })

}

module.exports = emitSocketEvents