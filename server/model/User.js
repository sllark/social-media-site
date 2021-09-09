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
    isOnline: {
        type: Boolean,
        default: false
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
    ],
    conersationWith:[ // list of users whom with I have conversation, list would be sorted according to latest conversations
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

})

User.index({firstName: 'text', lastName: 'text'});






User.statics = {

    searchPartial: function (q, skip, callback) {
        return this.find(
            {
                $or: [
                    {"firstName": new RegExp(q, "gi")},
                    {"lastName": new RegExp(q, "gi")},
                ],
            },
            "firstName lastName profilePicture bio dob gender isOnline",
            {
                limit: 20,
                skip: skip
            },
            callback);
    },

    searchFull: function (q, skip, callback) {
        return this.find(
            {$text: {$search: q, $caseSensitive: false}},
            "firstName lastName profilePicture bio dob gender isOnline",
            {
                limit: 20,
                skip: skip,
                sort: {score: {$meta: "textScore"}}
            },
            callback
        )
    },

    search: function (q, skip = 0, callback) {
        this.searchFull(q, skip, (err, data) => {
            if (err) return callback(err, data);
            if (!err && data.length) return callback(err, data);
            if (!err && data.length === 0) return this.searchPartial(q, skip, callback);
        });
    },
}


module.exports = model('User', User)