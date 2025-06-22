const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const { auth } = require('../middleware/auth');

// Follow a user
router.post('/:userId', auth, async (req, res) => {
  try {
    if (req.userId === req.params.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.userId,
      following: req.params.userId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    const follow = new Follow({
      follower: req.userId,
      following: req.params.userId
    });

    await follow.save();
    res.status(201).json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow a user
router.delete('/:userId', auth, async (req, res) => {
  try {
    const result = await Follow.findOneAndDelete({
      follower: req.userId,
      following: req.params.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get follow status
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const isFollowing = await Follow.exists({
      follower: req.userId,
      following: req.params.userId
    });

    res.json({ isFollowing: !!isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;