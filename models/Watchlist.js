const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movies: [{
    movieId: {
      type: String,
      required: true
    },
    movieTitle: {
      type: String,
      required: true
    },
    moviePoster: {
      type: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('Watchlist', watchlistSchema);