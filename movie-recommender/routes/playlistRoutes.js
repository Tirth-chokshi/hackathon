const express = require('express');
const router = express.Router();
const { requireAuth } = require('../config/middleware');
const { createPlaylist, getUserPlaylists, addToPlaylist, removeFromPlaylist } = require('../controllers/playlistController');

router.use(requireAuth);

router.post('/', createPlaylist);
router.get('/', getUserPlaylists);
router.post('/:playlistId/items', addToPlaylist);
router.delete('/:playlistId/items/:itemId', removeFromPlaylist);

module.exports = router;