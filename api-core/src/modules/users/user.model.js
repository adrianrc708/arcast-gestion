const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WatchlistSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        required: true
    },
    kind: {
        type: String,
        required: true,
        enum: ['Movie', 'TVShow']
    }
}, { _id: false });

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    watchlist: [WatchlistSchema]
});

module.exports = mongoose.model('User', UserSchema);