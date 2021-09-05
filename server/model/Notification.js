const {model, Schema} = require('mongoose')

const Notification = new Schema({
    person: { //user who made a notification event
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
    date: {
        type: Schema.Types.Date,
        required: true
    },
    notificationPostID: {  // where notification link will take you on front end
        type: String,
    },

})


module.exports = model("Notification", Notification)