const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const Follow = require('../models/Follow');
const { auth, requireRole } = require('../middleware/auth');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const reviewCount = await Review.countDocuments({ user: user._id });
    const followerCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.session.userId) {
      const follow = await Follow.findOne({
        follower: req.session.userId,
        following: user._id
      });
      isFollowing = !!follow;
    }

    res.json({
      ...user.toObject(),
      stats: {
        reviews: reviewCount,
        followers: followerCount,
        following: followingCount
      },
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { bio, avatar, favoriteGenres, isPrivate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bio, avatar, favoriteGenres, isPrivate },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.id })
      .populate('user', 'username avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id })
      .populate('follower', 'username avatar bio')
      .sort('-createdAt');
    res.json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id })
      .populate('following', 'username avatar bio')
      .sort('-createdAt');
    res.json(following.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all users
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update user role
router.put('/:id/role', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;