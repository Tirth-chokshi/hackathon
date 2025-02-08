const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  posterPath: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);