//this can show the playlist of yours

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit2, ChevronDown, ChevronUp, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PlaylistInsights from '../components/PlayListInsights';
const PlaylistItem = ({ playlist, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedDescription, setEditedDescription] = useState(playlist.description || '');
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/playlists/${playlist._id}`,
        { name: editedName, description: editedDescription },
        { withCredentials: true }
      );
      onUpdate({ ...playlist, name: editedName, description: editedDescription });
      setIsEditing(false);
      toast.success('Playlist updated successfully');
    } catch (error) {
      toast.error('Failed to update playlist');
    }
  };

  const handleRemoveItem = async (mediaId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/playlists/${playlist._id}/items/${mediaId}`,
        { withCredentials: true }
      );
      onUpdate({
        ...playlist,
        items: playlist.items.filter(item => item.mediaId !== mediaId)
      });
      toast.success('Item removed from playlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center">
        {isEditing ? (
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white mb-2"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
              placeholder="Add a description..."
              rows={2}
            />
          </div>
        ) : (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gold-500">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-gray-400 mt-1">{playlist.description}</p>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="p-2 text-green-500 hover:text-green-400"
              >
                <Save size={20} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-red-500 hover:text-red-400"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-500 hover:text-blue-400"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => onDelete(playlist._id)}
                className="p-2 text-red-500 hover:text-red-400"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-white"
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlist.items.map((item) => (
            <div key={item.mediaId} className="relative group">
              <Link to={`/media/${item.mediaId}?type=${item.mediaType}`}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img
                    src={item.posterPath ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}` : '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200" />
                </div>
                <h4 className="mt-2 text-sm text-white font-medium truncate">
                  {item.title}
                </h4>
              </Link>
              <button
                onClick={() => handleRemoveItem(item.mediaId)}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          ))}
      <PlaylistInsights playlist={playlist} />
        </div>
      )}
    </div>
  );
};

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/playlists', {
        withCredentials: true
      });
      setPlaylists(response.data.playlists);
    } catch (error) {
      toast.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/playlists/${playlistId}`, {
        withCredentials: true
      });
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      toast.success('Playlist deleted successfully');
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  const handleUpdatePlaylist = (updatedPlaylist) => {
    setPlaylists(playlists.map(p => 
      p._id === updatedPlaylist._id ? updatedPlaylist : p
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-gold-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gold-500 mb-8">My Playlists</h1>
        
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">You haven't created any playlists yet.</p>
          </div>
        ) : (
          playlists.map(playlist => (
            <PlaylistItem
              key={playlist._id}
              playlist={playlist}
              onDelete={handleDeletePlaylist}
              onUpdate={handleUpdatePlaylist}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;