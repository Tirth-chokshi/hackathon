import React, { useState } from 'react';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const PlaylistInsights = ({ playlist }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a prompt that includes relevant movie information
      const moviesInfo = playlist.items.map(item => ({
        title: item.title,
        type: item.mediaType
      }));

      const prompt = `Here's a movie playlist called "${playlist.name}":
        ${JSON.stringify(moviesInfo)}
        
        Please provide:
        1. A funny summary of what this playlist says about the person's taste
        2. A humorous personality analysis based on these choices
        3. Two funny movie recommendations that would fit this collection
        Make it witty and entertaining!`;

      const response = await fetch('http://localhost:3000/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to generate insights');
      
      const data = await response.json();
      setInsights(data.content);
    } catch (err) {
      setError('Failed to generate insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <button
        onClick={generateInsights}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Sparkles size={18} />
        )}
        Generate Fun Insights
      </button>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {insights && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="text-purple-400 mt-1" size={24} />
            <div className="space-y-4">
              <div className="prose prose-invert">
                {insights.split('\n').map((line, index) => (
                  <p key={index} className="text-gray-300">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistInsights;