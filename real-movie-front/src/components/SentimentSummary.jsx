import React from 'react';
import { ArrowUp, ArrowDown, Minus, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const SentimentSummary = ({ reviews, sentimentSummary }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <MessageSquare className="w-5 h-5" />
          <span>No reviews available yet</span>
        </div>
      </div>
    );
  }

  // Filter reviews based on timeframe
  const getFilteredReviews = () => {
    const now = new Date();
    switch (selectedTimeframe) {
      case 'week':
        return reviews.filter(review => 
          new Date(review.created_at) > new Date(now - 7 * 24 * 60 * 60 * 1000)
        );
      case 'month':
        return reviews.filter(review => 
          new Date(review.created_at) > new Date(now - 30 * 24 * 60 * 60 * 1000)
        );
      default:
        return reviews;
    }
  };

  const filteredReviews = getFilteredReviews();
  const totalReviews = filteredReviews.length;

  // Calculate sentiment statistics
  const sentimentCounts = filteredReviews.reduce((acc, review) => {
    if (review.sentiment?.sentiment) {
      acc[review.sentiment.sentiment] = (acc[review.sentiment.sentiment] || 0) + 1;
    }
    return acc;
  }, {});

  const averageScore = filteredReviews.reduce((sum, review) => 
    sum + (review.sentiment?.score || 0), 0) / totalReviews;

  // Helper function to get percentage
  const getPercentage = (count) => ((count || 0) / totalReviews * 100).toFixed(1);

  // Determine overall sentiment
  const overallSentiment = 
    averageScore > 0.2 ? 'Positive' :
    averageScore < -0.2 ? 'Negative' : 'Neutral';

  // Sentiment configuration
  const sentimentConfig = {
    Positive: { icon: ArrowUp, color: 'text-green-500', bgColor: 'bg-green-500' },
    Negative: { icon: ArrowDown, color: 'text-red-500', bgColor: 'bg-red-500' },
    Neutral: { icon: Minus, color: 'text-yellow-500', bgColor: 'bg-yellow-500' }
  };

  const { icon: Icon, color, bgColor } = sentimentConfig[overallSentiment];

  // Calculate trend
  const trend = sentimentSummary?.average_score > averageScore ? 'decreasing' : 'increasing';

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gold-500">Sentiment Analysis</h3>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="bg-gray-800 text-white rounded-md px-3 py-1 border border-gray-700"
        >
          <option value="all">All Time</option>
          <option value="month">Last 30 Days</option>
          <option value="week">Last 7 Days</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${bgColor} bg-opacity-20`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Overall Sentiment</div>
              <div className={`text-xl font-bold ${color}`}>{overallSentiment}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-blue-500 bg-opacity-20">
              <TrendingUp className={`w-8 h-8 ${trend === 'increasing' ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Sentiment Trend</div>
              <div className="text-xl font-bold">
                {trend === 'increasing' ? 'Improving' : 'Declining'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {['Positive', 'Neutral', 'Negative'].map((sentiment) => (
            <div key={sentiment} className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">{sentiment}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {sentimentCounts[sentiment.toLowerCase()] || 0} reviews
                  </span>
                  <span className="text-sm text-gray-400">
                    ({getPercentage(sentimentCounts[sentiment.toLowerCase()])}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div 
                  className={`h-full ${sentimentConfig[sentiment].bgColor} rounded-full transition-all duration-300`}
                  style={{ width: `${getPercentage(sentimentCounts[sentiment.toLowerCase()])}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedTimeframe !== 'all' && totalReviews === 0 && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-500">
          <AlertTriangle className="w-5 h-5" />
          <span>No reviews available for selected timeframe</span>
        </div>
      )}
    </div>
  );
};

export default SentimentSummary;