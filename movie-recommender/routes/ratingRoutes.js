const express = require('express');
const router = express.Router();
const { requireAuth } = require('../config/middleware');
const { rateMedia, getUserRatings, getRatingsByScore } = require('../controllers/ratingController');

router.use(requireAuth);

router.post('/', rateMedia);
router.get('/', getUserRatings);
router.get('/grouped', getRatingsByScore);

module.exports = router;