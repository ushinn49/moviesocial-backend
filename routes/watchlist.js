const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const { auth } = require('../middleware/auth');

// Get user's watchlist
router.get('/', auth, async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.userId, movies: [] });
      await watchlist.save();
    }

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add movie to watchlist
router.post('/add', auth, async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster } = req.body;

    let watchlist = await Watchlist.findOne({ user: req.userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.userId, movies: [] });
    }

    // Check if movie already in watchlist
    const movieExists = watchlist.movies.some(m => m.movieId === movieId);
    
    if (movieExists) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    watchlist.movies.push({ movieId, movieTitle, moviePoster });
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove movie from watchlist
router.delete('/remove/:movieId', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.userId });
    
    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    watchlist.movies = watchlist.movies.filter(
      m => m.movieId !== req.params.movieId
    );
    
    await watchlist.save();
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if movie is in watchlist
router.get('/check/:movieId', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.userId });
    
    if (!watchlist) {
      return res.json({ inWatchlist: false });
    }

    const inWatchlist = watchlist.movies.some(
      m => m.movieId === req.params.movieId
    );
    
    res.json({ inWatchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;