const Playlist = require('../models/Playlist');

const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = new Playlist({
      name,
      description,
      userId: req.user.userId,
      items: []
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error creating playlist', error: error.message });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.userId });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists', error: error.message });
  }
};

const addToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { mediaId, mediaType, title, posterPath } = req.body;
  
  try {
    const playlist = await Playlist.findOne({ _id: playlistId, userId: req.user.userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.items.push({ mediaId, mediaType, title, posterPath });
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to playlist', error: error.message });
  }
};

const removeFromPlaylist = async (req, res) => {
  const { playlistId, itemId } = req.params;
  
  try {
    const playlist = await Playlist.findOne({ _id: playlistId, userId: req.user.userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.items = playlist.items.filter(item => item._id.toString() !== itemId);
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from playlist', error: error.message });
  }
};

module.exports = { createPlaylist, getUserPlaylists, addToPlaylist, removeFromPlaylist };