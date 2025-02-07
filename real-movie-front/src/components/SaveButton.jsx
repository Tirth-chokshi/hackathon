import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, X, Bookmark, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PlaylistModal = ({ media, isOpen, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/playlists', {
        withCredentials: true
      });
      setPlaylists(response.data.playlists);
    } catch (error) {
      toast.error('Error fetching playlists');
    }
    setLoading(false);
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    setCreating(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/api/playlists',
        { name: newPlaylistName },
        { withCredentials: true }
      );
      setPlaylists([...playlists, response.data.playlist]);
      setNewPlaylistName('');
      toast.success('Playlist created!');
    } catch (error) {
      toast.error('Error creating playlist');
    }
    setCreating(false);
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/playlists/${playlistId}/items`,
        {
          mediaId: media.id,
          mediaType: media.media_type || 'movie',
          title: media.title || media.name,
          posterPath: media.poster_path
        },
        { withCredentials: true }
      );
      toast.success('Added to playlist!');
      onClose();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Already in playlist');
      } else {
        toast.error('Error adding to playlist');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gold-500">Save to Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="flex-1 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white"
            />
            <button
              onClick={createPlaylist}
              disabled={creating}
              className="px-4 py-2 bg-gold-500 text-black rounded hover:bg-gold-600 disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" /> : <PlusCircle />}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gold-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  onClick={() => addToPlaylist(playlist._id)}
                  className="w-full p-3 bg-gray-800 rounded hover:bg-gray-700 text-left flex justify-between items-center"
                >
                  <span>{playlist.name}</span>
                  <span className="text-sm text-gray-400">
                    {playlist.items.length} items
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SaveButton = ({ media }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
<button
  onClick={() => setIsModalOpen(true)}
  style={{
    backgroundColor: "lightseagreen",
  }}
  className="flex items-center gap-2 px-4 py-2 
    text-black font-bold 
    rounded-lg 
    transition-all duration-300 
    shadow-md hover:shadow-lg 
    hover:scale-105 
    focus:outline-none 
    focus:ring-2 focus:ring-opacity-75 
    active:scale-95 
    transform 
    group"
>
        <Bookmark className="group-hover:scale-110 transition-transform" />
        Save to Playlist
      </button>
      <PlaylistModal
        media={media}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SaveButton;