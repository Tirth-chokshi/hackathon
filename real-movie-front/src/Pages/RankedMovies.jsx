//this is the page where all movies are ranked 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ThumbsUp, Award, ThumbsDown } from 'lucide-react';

const RankedMovies = () => {
  const [rankedMovies, setRankedMovies] = useState({
    good: [],
    better: [],
    worst: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('good');
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/ratings', {
        withCredentials: true
      });

      // Process and aggregate the ratings
      const processedRatings = {
        good: aggregateAndSortMovies(response.data.ratings.good),
        better: aggregateAndSortMovies(response.data.ratings.better),
        worst: aggregateAndSortMovies(response.data.ratings.worst)
      };

      setRankedMovies(processedRatings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateAndSortMovies = (ratings) => {
    // Create a map to store vote counts for each movie
    const movieMap = new Map();

    // Count votes for each movie
    ratings.forEach(rating => {
      const key = rating.mediaId;
      if (!movieMap.has(key)) {
        movieMap.set(key, {
          mediaId: rating.mediaId,
          mediaType: rating.mediaType,
          title: rating.title,
          posterPath: rating.posterPath,
          voteCount: 1
        });
      } else {
        const movie = movieMap.get(key);
        movie.voteCount += 1;
      }
    });

    // Convert map to array and sort by vote count
    return Array.from(movieMap.values())
      .sort((a, b) => b.voteCount - a.voteCount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-gold-500" size={48} />
      </div>
    );
  }

  const TabButton = ({ type, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
        activeTab === type 
          ? 'bg-gold-500 text-black' 
          : 'bg-gray-800 text-white hover:bg-gray-700'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span className="ml-2 bg-gray-900 text-white px-2 py-1 rounded-full text-sm">
        {rankedMovies[type].length}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gold-500 mb-8">Movie Rankings</h1>
        
        <div className="flex space-x-4 mb-8">
          <TabButton type="good" icon={ThumbsUp} label="Good" />
          <TabButton type="better" icon={Award} label="Better" />
          <TabButton type="worst" icon={ThumbsDown} label="Worst" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rankedMovies[activeTab].map((movie, index) => (
            <div
              key={movie.mediaId}
              className="bg-gray-900 rounded-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={movie.posterPath ? `${TMDB_IMAGE_BASE_URL}${movie.posterPath}` : '/placeholder.jpg'}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 px-3 py-1 rounded-full text-gold-500 font-bold">
                  #{index + 1}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gold-300 mb-2 truncate">
                  {movie.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {movie.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                  </span>
                  <span className="bg-gold-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    {movie.voteCount} {movie.voteCount === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rankedMovies[activeTab].length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies rated in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankedMovies;