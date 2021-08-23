const {model, Schema} = require('mongoose');
const Notification = require('./Notification')

const User = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: String,
    coverPicture: String,
    bio: String,
    dob: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    friendRequests: [ // requests received, id of user that sent req
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    friendRequestsSent: [ // id of user to whom req is sent by me
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    notifications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ]

})


module.exports = model('User', User)