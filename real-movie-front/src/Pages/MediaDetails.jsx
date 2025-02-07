//this is the page where we can see specific movie deatils on media/:id
//this contains revewi submission and showing

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SaveButton from '../components/SaveButton';
import { useTheme } from '../contexts/ThemeContext';
import { VideoSection } from '../components/VideoSection';
import { ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import SentimentSummary from '../components/SentimentSummary';
import RatingButtons from '../components/RatingButtons';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const ReviewList = ({ reviews }) => {
  
  // Helper function to render sentiment icon and color
  const renderSentimentIndicator = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: <ThumbsUp className="text-green-500" />,
          color: 'text-green-500',
          label: 'Positive'
        };
      case 'negative':
        return {
          icon: <ThumbsDown className="text-red-500" />,
          color: 'text-red-500',
          label: 'Negative'
        };
      default:
        return {
          icon: <Meh className="text-gray-500" />,
          color: 'text-gray-500',
          label: 'Neutral'
        };
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const sentimentInfo = renderSentimentIndicator(review.sentiment?.sentiment || 'neutral');
        
        return (
          <div 
            key={review.id} 
            className="bg-gray-800 rounded-lg p-4 shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gold-300">{review.author}</span>
                {review.author_details?.rating && (
                  <span className="text-sm text-gray-400">
                    Rating: {review.author_details.rating}/10
                  </span>
                )}
              </div>
              <div 
                className={`flex items-center space-x-2 ${sentimentInfo.color}`}
                title={`Sentiment: ${sentimentInfo.label} (Score: ${(review.sentiment?.score || 0).toFixed(2)})`}
              >
                {sentimentInfo.icon}
                <span className="text-xs">{sentimentInfo.label}</span>
              </div>
            </div>
            <p className="text-gray-300">{review.content}</p>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(review.created_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ReviewForm = ({ mediaId, mediaType, onReviewSubmitted }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim() || rating === 0) {
      toast.error('Please provide both a review and a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/media/${mediaId}/reviews`,
        { content: review, rating, type: mediaType },
        { withCredentials: true }
      );

      if (response.data.success) {
        onReviewSubmitted(response.data.data);
        setReview('');
        setRating(0);
        toast.success('Review submitted successfully!');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="mb-4">
        <label htmlFor="review" className="block text-lg font-medium text-gold-300 mb-2">
          Your Review
        </label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full p-4 border border-gold-500 rounded-lg bg-gray-800 text-white"
          rows={4}
          placeholder="Write your review here..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-medium text-gold-300 mb-2">
          Your Rating
        </label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer ${
                star <= rating ? 'text-yellow-400' : 'text-gray-400'
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-gold-500 text-black rounded-md hover:bg-gold-600 disabled:bg-gray-400 text-lg font-semibold"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const MediaDetails = () => {
  const { id } = useParams();
  const {darkMode} = useTheme()
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'movie';
  const [media, setMedia] = useState(null);
  const [userReviews, setUserReviews] = useState({ reviews: [], sentiment_summary: null });
  const [tmdbReviews, setTmdbReviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const parallaxRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        setLoading(true);
        const [mediaResponse, userReviewsResponse, tmdbReviewsResponse, videosResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/media/${id}?type=${type}`),
          axios.get(`http://localhost:3000/api/media/${id}/reviews?type=${type}`),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/reviews?api_key=b0ab482e7adb846ca2f97fa3eddd6a59`),
          axios.get(`http://localhost:3000/api/media/${id}/videos?type=${type}`),
        ]);

        setMedia(mediaResponse.data);
        setUserReviews(userReviewsResponse.data);
        setTmdbReviews(tmdbReviewsResponse.data.results);
        setVideos(videosResponse.data);
      } catch (err) {
        console.error('Error fetching media details:', err);
        setError(err.message || 'An error occurred');
        toast.error('Error loading content');
      } finally {
        setLoading(false);
      }
    };

    if (id && type) {
      fetchMediaDetails();
    }
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gold-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gold-500 text-xl">No media found</div>
      </div>
    );
  }

  const releaseDate = media.release_date || media.first_air_date;
  const title = media.title || media.name;
  const averageRating = media.vote_average?.toFixed(1) || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div ref={parallaxRef} className="relative h-screen overflow-hidden">
        {media.backdrop_path && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url(${TMDB_IMAGE_BASE_URL}original${media.backdrop_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              y,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">{title}</h1>
            <div className="flex items-center justify-center space-x-4 text-xl">
              <span>{new Date(releaseDate).getFullYear()}</span>
              <span>•</span>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" />
                <span>{averageRating}/10</span>
              </div>
              {media.runtime && (
                <>
                  <span>•</span>
                  <span>{media.runtime} min</span>
                </>
              )}
            </div>
            <div className="mt-4 ml-56">
    <SaveButton media={media} />
  </div>
          </div>
         
        </div>
      </div>
      <RatingButtons media={media} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-8 shadow-lg mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gold-500">Overview</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">{media.overview}</p>
              {media.genres && (
                <div className="flex flex-wrap gap-2">
                  {media.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-2 bg-gold-500 text-black rounded-full text-sm font-semibold"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <VideoSection videos={videos} />

            <div className="mt-12 mb-12">
            <SentimentSummary 
  reviews={userReviews.reviews} 
  sentimentSummary={userReviews.sentiment_summary}
/>
            </div>

            <div className="bg-gray-900 rounded-lg p-8 shadow-lg mt-12">
              <h2 className="text-3xl font-bold mb-6 text-gold-500">Reviews</h2>

              {/* User Reviews Section */}
              <h3 className="text-2xl font-bold mb-4 text-gold-300">User Reviews</h3>
              <ReviewForm
                mediaId={id}
                mediaType={type}
                onReviewSubmitted={(newReview) => setUserReviews(prevState => ({
                  ...prevState,
                  reviews: [newReview, ...prevState.reviews]
                }))}
              />
              {userReviews && userReviews.reviews ? (
                <ReviewList reviews={userReviews.reviews} />
              ) : (
                <p className="text-gray-400">No user reviews available yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-lg overflow-hidden shadow-lg mb-8">
                {media.poster_path && (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}w500${media.poster_path}`}
                    alt={`${title} poster`}
                    className="w-full"
                  />
                )}
              </div>

              <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gold-500">Quick Info</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-gold-300 font-semibold">Status</dt>
                    <dd className="text-white">{media.status}</dd>
                  </div>
                  <div>
                    <dt className="text-gold-300 font-semibold">Original Language</dt>
                    <dd className="text-white">{media.original_language?.toUpperCase()}</dd>
                  </div>
                  {media.budget > 0 && (
                    <div>
                      <dt className="text-gold-300 font-semibold">Budget</dt>
                      <dd className="text-white">${media.budget?.toLocaleString()}</dd>
                    </div>
                  )}
                  {media.revenue > 0 && (
                    <div>
                      <dt className="text-gold-300 font-semibold">Revenue</dt>
                      <dd className="text-white">${media.revenue?.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;

