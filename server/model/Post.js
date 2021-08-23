const {model, Schema} = require('mongoose')
const CommentBy = require('./CommentBy')

const Post = new Schema({
    user: { // post author
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postText: {
        type: String,
        required: true
    },
    postImage:String,

    likes: {
        type: {
            count: {
                type: Number,
                default: 0
            },
            by: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                }
            ],
        },
    },
    comments: {
        type: {
            count: {
                type: Number,
                default: 0
            },
            by: [
                {
                    type:Schema.Types.ObjectId,
                    ref:'CommentBy'
                }
            ]
        },
    }
}, {timestamps: true})


module.exports = model("Post", Post);