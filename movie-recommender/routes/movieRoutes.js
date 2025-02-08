const express = require('express');
const router = express.Router();
const { getRandomMedia, getMediaReviews, getRecommendations } = require('../controllers/movieController');

router.get('/random', getRandomMedia);
router.get('/:mediaId/reviews', getMediaReviews);
router.get('/:mediaId/recommendations', getRecommendations);

module.exports = router;