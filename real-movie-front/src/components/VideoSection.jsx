//this component show the video secttion of the movies

import React, { useState } from 'react';
import { Play, ChevronRight } from 'lucide-react';

export const VideoSection = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const videoCategories = {
    Trailer: videos.filter(v => v.type === 'Trailer'),
    Teaser: videos.filter(v => v.type === 'Teaser'),
    Featurette: videos.filter(v => v.type === 'Featurette'),
    'Behind the Scenes': videos.filter(v => v.type === 'Behind the Scenes')
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gold-500">Videos</h2>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-4 rounded-lg w-full max-w-4xl">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.key}`}
                title={selectedVideo.name}
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 px-4 py-2 bg-gold-500 text-black rounded hover:bg-gold-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {Object.entries(videoCategories).map(([category, categoryVideos]) => (
        categoryVideos.length > 0 && (
          <div key={category} className="mb-6">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className="text-xl font-semibold mb-4 text-gold-300 flex items-center"
            >
              {category}
              <ChevronRight
                className={`ml-2 transform transition-transform ${
                  expandedCategory === category ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedCategory === category && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryVideos.map((video) => (
                  <div
                    key={video.key}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={48} className="text-gold-500" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-300 line-clamp-2">{video.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ))}

      {Object.values(videoCategories).every(videos => videos.length === 0) && (
        <p className="text-gray-400 text-center py-4">No videos available.</p>
      )}
    </div>
  );
};

