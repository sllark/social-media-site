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
    isShared: {
        type:Boolean,
        default:false
    },
    sharedFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
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
    },
    shares: {
        type: {
            count: {
                type: Number,
                default: 0
            },
            by: [
                {
                    type:Schema.Types.ObjectId,
                    ref:'User'
                }
            ]
        },
    }
}, {timestamps: true})


module.exports = model("Post", Post);