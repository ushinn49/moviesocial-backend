const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  reviewText: {
    type: String,
    required: true,
    minlength: 10
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);