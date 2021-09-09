const {model, Schema} = require('mongoose')

const Notification = new Schema({
    userID:{ // user to whom notification should be shown, notification receiver
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    person: { //user who made a notification event, notification sender
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true
    },
    notificationType: {
        //- req
        //- comment
        //- like
        //- commentLike
        //- share
        type: String,
        required: true
    },
    commentID:{ // comment is liked then save commentID here
        type: Schema.Types.ObjectId,
        ref: 'CommentBy',
    },
    date: {
        type: Schema.Types.Date,
        required: true
    },
    notificationPostID: {  // where notification link will take you on front end
        type: String,
    },
    isRead:{
        type: Boolean,
        default:false
    }

})


module.exports = model("Notification", Notification)