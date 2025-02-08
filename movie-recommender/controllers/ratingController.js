const Rating = require('../models/Rating');

const rateMedia = async (req, res) => {
  try {
    const { mediaId, mediaType, rating, title, posterPath } = req.body;
    
    let userRating = await Rating.findOne({
      userId: req.user.userId,
      mediaId,
      mediaType
    });

    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      userRating = new Rating({
        userId: req.user.userId,
        mediaId,
        mediaType,
        rating,
        title,
        posterPath
      });
      await userRating.save();
    }

    res.json(userRating);
  } catch (error) {
    res.status(500).json({ message: 'Error rating media', error: error.message });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.user.userId })
      .sort('-createdAt');
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings', error: error.message });
  }
};

const getRatingsByScore = async (req, res) => {
  try {
    const allRatings = await Rating.find()
      .sort('-createdAt');
    
    const groupedRatings = {
      '5': allRatings.filter(r => r.rating === 5),
      '4': allRatings.filter(r => r.rating === 4),
      '3': allRatings.filter(r => r.rating === 3),
      '2': allRatings.filter(r => r.rating === 2),
      '1': allRatings.filter(r => r.rating === 1)
    };
    
    res.json(groupedRatings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grouped ratings', error: error.message });
  }
};

module.exports = { rateMedia, getUserRatings, getRatingsByScore };