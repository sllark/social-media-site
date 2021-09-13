const {model, Schema} = require('mongoose');

const Message = new Schema({
    chatID: {
        type: String,
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: String,
        required: true
    },
    w: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})


module.exports = model('Message', Message)