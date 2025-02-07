const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
require('dotenv').config();
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const TMDB_API_KEY ="b0ab482e7adb846ca2f97fa3eddd6a59";

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));


  const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    items: [{
      mediaId: { type: String, required: true },
      mediaType: { type: String, required: true },
      title: { type: String, required: true },
      posterPath: { type: String },
      addedAt: { type: Date, default: Date.now }
    }]
  });
  
  
  const Playlist = mongoose.model('Playlist', playlistSchema);



// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  selectedMovies: { type: [Number], default: [] },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  playlists: [playlistSchema]  // Add this line
});

const User = mongoose.model('User', userSchema);

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, required: true, enum: ['movie', 'tv'] },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);


    
const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  rating: { type: String, enum: ['good', 'better', 'worst'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);



const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error();
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});
// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ 
      message: 'Login successful',
      username: user.username 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});





// Route to fetch genres (Movies & TV Shows)
app.get("/api/genres/:type", async (req, res) => {
  try {
      const { type } = req.params; // 'movie' or 'tv'
      const response = await axios.get(`${TMDB_BASE_URL}/genre/${type}/list`, {
          params: { api_key: TMDB_API_KEY },
      });
      res.json(response.data.genres);
  } catch (error) {
      res.status(500).json({ error: "Error fetching genres" });
  }
});

app.get("/api/streaming-providers/:type", async (req, res) => {
  try {
      const { type } = req.params;
      const response = await axios.get(`${TMDB_BASE_URL}/watch/providers/${type}`, {
          params: { api_key: TMDB_API_KEY, watch_region: 'US' },
      });
      res.json(response.data.results);
  } catch (error) {
      res.status(500).json({ error: "Error fetching streaming providers" });
  }
});

// Route to fetch filtered movies or TV shows
app.get("/api/discover", async (req, res) => {
  try {
      const { type, genre, year, rating, language, cast, sort_by, certification, streaming_provider, page = 1 } = req.query;
      
      const params = {
          api_key: TMDB_API_KEY,
          with_genres: genre || "",
          primary_release_year: year || "",
          "vote_average.gte": rating || "",
          with_original_language: language || "",
          with_cast: cast || "",
          sort_by: sort_by || "popularity.desc",
          watch_region: 'US',
          page: page
      };

      // Add certification parameter conditionally and differently for movie/tv
      if (certification) {
          if (type === 'movie') {
              params.certification_country = 'US';
              params.certification = certification;
          } else if (type === 'tv') {
              params.content_rating = certification;
          }
      }

      if (streaming_provider) {
          params.with_watch_providers = streaming_provider;
      }

      const response = await axios.get(`${TMDB_BASE_URL}/discover/${type}`, { params });
      
      res.json({
          results: response.data.results,
          total_pages: response.data.total_pages,
          total_results: response.data.total_results,
          page: response.data.page
      });
  } catch (error) {
      console.error("Discovery error:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error fetching recommendations" });
  }
});
// Route to search for cast/crew
app.get("/api/search/person", async (req, res) => {
  try {
      const { query } = req.query;
      const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
          params: { api_key: TMDB_API_KEY, query },
      });
      res.json(response.data.results);
  } catch (error) {
      res.status(500).json({ error: "Error searching for person" });
  }
});







app.get('/api/random', async (req, res) => {
  const { type } = req.query;
  const validMediaTypes = ['movie', 'tv', 'animation'];
  const mediaType = validMediaTypes.includes(type) ? type : 'movie';

  const params = {
    api_key: TMDB_API_KEY,
    sort_by: 'popularity.desc',
    page: Math.floor(Math.random() * 500) + 1,
    include_adult: false,
    'vote_count.gte': 100, // Ensure some minimum number of votes
  };

  // Add specific filters based on media type
  if (mediaType === 'animation') {
    params.with_genres = '16'; // Animation genre ID in TMDB
    params.with_original_language = 'en|ja'; // Include both English and Japanese animation
  }

  if (mediaType === 'movie' || mediaType === 'animation') {
    params['vote_average.gte'] = 6.0; // Minimum rating threshold
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/discover/${mediaType === 'animation' ? 'movie' : mediaType}`, {
      params,
    });

    const results = response.data.results;
    if (results.length === 0) {
      return res.status(404).send('No content found');
    }

    // Pick a random item from the results
    const randomItem = results[Math.floor(Math.random() * results.length)];

    // Enhance the response with additional data
    const enhancedItem = {
      ...randomItem,
      media_type: mediaType,
      backdrop_url: randomItem.backdrop_path ? 
        `https://image.tmdb.org/t/p/original${randomItem.backdrop_path}` : null,
      poster_url: randomItem.poster_path ?
        `https://image.tmdb.org/t/p/w500${randomItem.poster_path}` : null,
    };

    res.json(enhancedItem);
  } catch (error) {
    console.error('Error fetching random content:', error);
    res.status(500).send('Error fetching random content');
  }
});


// Route to fetch all media (movies, series, etc.) with optional search
app.get('/api/media', async (req, res) => {
  const { query } = req.query;

  const params = {
    api_key: TMDB_API_KEY,
    query: query || '', // Optional search query
  };

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/multi', { params });
    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).send('Error fetching media');
  }
});

// Route to fetch full details of a specific movie or TV show
app.get('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!type || !['movie', 'tv'].includes(type)) {
    return res.status(400).send('Invalid type specified');
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching media details:', error.message);
    res.status(500).send('Error fetching media details');
  }
});









app.post('/api/media/:mediaId/reviews', requireAuth, async (req, res) => {
  const { mediaId } = req.params;
  const { content, rating, type } = req.body;
  
  try {
    // Create new review
    const newReview = new Review({
      userId: req.user._id,
      username: req.user.username,
      mediaId: mediaId,
      mediaType: type,
      content: content,
      rating: rating
    });

    // Save the review
    const savedReview = await newReview.save();

    // Update user's reviews array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { reviews: savedReview._id } }
    );

    // Send back the saved review
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting review',
      error: error.message 
    });
  }
});



const { spawn } = require("child_process");
app.get('/api/media/:mediaId/reviews', async (req, res) => {
  const { mediaId } = req.params;
  const { type } = req.query;

  try {
    // Get reviews from database
    const userReviews = await Review.find({ mediaId, mediaType: type })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');

    // If no reviews exist, return default structure
    if (!userReviews.length) {
      return res.json({
        reviews: [],
        sentiment_summary: {
          average_score: 0,
          total_reviews: 0,
          sentiment_distribution: {
            positive: 0,
            neutral: 0,
            negative: 0
          }
        }
      });
    }

    // Format reviews for sentiment analysis
    const formattedReviews = userReviews.map(review => ({
      id: review._id,
      author: review.username || 'Anonymous',
      content: review.content,
      created_at: review.createdAt,
      author_details: { 
        rating: review.rating, 
        username: review.username 
      },
    }));

    // Convert reviews to JSON for Python
    const reviewsJson = JSON.stringify(formattedReviews.map(r => r.content));

    // Run sentiment analysis
    const pythonProcess = spawn("python", ["sentiment_analysis.py", reviewsJson]);
    
    let pythonData = "";
    
    pythonProcess.stdout.on("data", (data) => {
      pythonData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          error: "Error in sentiment analysis process" 
        });
      }

      try {
        const sentimentResults = JSON.parse(pythonData);
        
        // Combine sentiment with reviews
        const reviewsWithSentiment = formattedReviews.map((review, index) => ({
          ...review,
          sentiment: {
            sentiment: sentimentResults.reviews[index].sentiment,
            score: sentimentResults.reviews[index].score
          }
        }));

        res.json({
          reviews: reviewsWithSentiment,
          sentiment_summary: sentimentResults.overall
        });
      } catch (error) {
        console.error('Error parsing sentiment results:', error);
        res.status(500).json({ 
          error: "Error processing sentiment analysis" 
        });
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reviews', 
      error: error.message 
    });
  }
});



// Add this new endpoint in your Express server file
app.get('/api/media/:id/videos', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!type || !['movie', 'tv'].includes(type)) {
    return res.status(400).send('Invalid type specified');
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}/videos`, 
      { params: { api_key: TMDB_API_KEY } }
    );
    
    // Filter and categorize videos
    const videos = response.data.results.filter(video => 
      ['Trailer', 'Teaser', 'Featurette', 'Behind the Scenes'].includes(video.type) &&
      video.site === 'YouTube' // Only include YouTube videos
    );
    
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).send('Error fetching videos');
  }
});








app.post('/api/playlists', requireAuth, async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    user.playlists.push({ name, description, items: [] });
    await user.save();
    
    res.status(201).json({
      success: true,
      playlist: user.playlists[user.playlists.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating playlist' });
  }
});

// Get user's playlists
app.get('/api/playlists', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, playlists: user.playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching playlists' });
  }
});
app.post('/api/playlists/:playlistId/items', requireAuth, async (req, res) => {
  const { playlistId } = req.params;
  const { mediaId, mediaType, title, posterPath } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    // Check if media already exists in playlist, considering both mediaId and mediaType
    const exists = playlist.items.some(
      item => item.mediaId === mediaId && item.mediaType === mediaType
    );
    
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'This media is already in the playlist' 
      });
    }
    
    playlist.items.push({ mediaId, mediaType, title, posterPath });
    await user.save();
    
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding to playlist' });
  }
});

// Remove media from playlist
app.delete('/api/playlists/:playlistId/items/:mediaId', requireAuth, async (req, res) => {
  const { playlistId, mediaId } = req.params;
  
  try {
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    playlist.items = playlist.items.filter(item => item.mediaId !== mediaId);
    await user.save();
    
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing from playlist' });
  }
});



app.delete('/api/playlists/:playlistId', requireAuth, async (req, res) => {
  const { playlistId } = req.params;
  
  try {
    const user = await User.findById(req.user._id);
    user.playlists = user.playlists.filter(p => p._id.toString() !== playlistId);
    await user.save();
    
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting playlist' });
  }
});

app.put('/api/playlists/:playlistId', requireAuth, async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    
    playlist.name = name;
    playlist.description = description;
    await user.save();
    
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating playlist' });
  }
});

app.post('/api/generate-insights', requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ success: true, content: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating insights'
    });
  }
});





app.post('/api/media/:mediaId/rate', requireAuth, async (req, res) => {
  const { mediaId } = req.params;
  const { rating, mediaType, title, posterPath } = req.body;
  
  try {
    // Check if user has already rated this media
    let existingRating = await Rating.findOne({
      userId: req.user._id,
      mediaId: mediaId
    });
    
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      existingRating = await Rating.create({
        userId: req.user._id,
        mediaId,
        mediaType,
        title,
        posterPath,
        rating
      });
    }
    
    res.json({ success: true, rating: existingRating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving rating' });
  }
});

// Get ratings for a specific media
app.get('/api/media/:mediaId/ratings', async (req, res) => {
  const { mediaId } = req.params;
  
  try {
    const ratings = await Rating.find({ mediaId })
      .populate('userId', 'username');
    
    // Calculate counts
    const counts = {
      good: ratings.filter(r => r.rating === 'good').length,
      better: ratings.filter(r => r.rating === 'better').length,
      worst: ratings.filter(r => r.rating === 'worst').length,
      total: ratings.length
    };
    
    res.json({ success: true, ratings, counts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ratings' });
  }
});

// Get all rated movies grouped by rating
app.get('/api/ratings', async (req, res) => {
  try {
    const allRatings = await Rating.find()
      .sort('-createdAt')
      .populate('userId', 'username');
    
    // Group by rating category
    const groupedRatings = {
      good: allRatings.filter(r => r.rating === 'good'),
      better: allRatings.filter(r => r.rating === 'better'),
      worst: allRatings.filter(r => r.rating === 'worst')
    };
    
    res.json({ success: true, ratings: groupedRatings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ratings' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
