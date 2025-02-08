const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getRandomMedia = async (req, res) => {
  const { type } = req.query;
  const validMediaTypes = ['movie', 'tv', 'animation'];
  const mediaType = validMediaTypes.includes(type) ? type : 'movie';

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/${mediaType}`, {
      params: {
        api_key: TMDB_API_KEY,
        sort_by: 'popularity.desc',
        page: Math.floor(Math.random() * 10) + 1
      }
    });

    const results = response.data.results;
    const randomItem = results[Math.floor(Math.random() * results.length)];
    res.json(randomItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random media', error: error.message });
  }
};

const getMediaReviews = async (req, res) => {
  const { mediaId } = req.params;
  const { type } = req.query;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${type}/${mediaId}/reviews`, {
      params: { api_key: TMDB_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  const { mediaId } = req.params;
  const { type } = req.query;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${type}/${mediaId}/recommendations`, {
      params: { api_key: TMDB_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};

module.exports = { getRandomMedia, getMediaReviews, getRecommendations };