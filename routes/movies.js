const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Search movies
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get movie details
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${req.params.id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,similar'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get popular movies
router.get('/trending/popular', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1
      }
    });

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending movies
router.get('/trending/week', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY
      }
    });

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;