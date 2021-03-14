const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suggestionSchema = new Schema({
    dishId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

var Suggestions = mongoose.model('Suggestion',suggestionSchema);
module.exports = Suggestions;