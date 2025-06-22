const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster, rating, reviewText } = req.body;

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      user: req.userId,
      movieId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const review = new Review({
      user: req.userId,
      movieId,
      movieTitle,
      moviePoster,
      rating,
      reviewText
    });

    await review.save();
    await review.populate('user', 'username avatar');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('user', 'username avatar role')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent reviews (for home page)
router.get('/recent', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username avatar')
      .sort('-createdAt')
      .limit(10);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { rating, reviewText } = req.body;
    review.rating = rating;
    review.reviewText = reviewText;
    review.updatedAt = Date.now();

    await review.save();
    await review.populate('user', 'username avatar');

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/unlike review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const likeIndex = review.likes.indexOf(req.userId);
    
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(req.userId);
    }

    await review.save();
    res.json({ likes: review.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;