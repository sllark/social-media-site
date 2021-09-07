const {model, Schema} = require('mongoose')


const CommentBy = new Schema({
    person: { // user who made comment
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    postID: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    content: String,
    likes: {
        count: {
            type: Number,
            default: 0
        },
        by: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ]
    },
    date: Schema.Types.Date,
})


module.exports = model("CommentBy", CommentBy)