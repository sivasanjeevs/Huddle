const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const { authenticate } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for photo uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

router.post('/', authenticate, lobbyController.createLobby);
router.get('/', authenticate, lobbyController.getLobbies);
router.get('/my-lobbies', authenticate, lobbyController.getMyLobbies);
router.post('/:id/join', authenticate, lobbyController.joinLobby);
router.post('/:id/leave', authenticate, lobbyController.leaveLobby);
router.get('/:id', authenticate, lobbyController.getLobbyById);
router.get('/:id/messages', authenticate, lobbyController.getLobbyMessages);
router.delete('/:id/hard', authenticate, lobbyController.hardDeleteLobby); // MUST be before /:id
router.delete('/:id', authenticate, lobbyController.deleteLobby); // This soft deletes (ends)
router.put('/:id', authenticate, lobbyController.updateLobby);

router.post('/:id/like', authenticate, lobbyController.toggleLike);
router.get('/:id/comments', authenticate, lobbyController.getComments);
router.post('/:id/comments', authenticate, lobbyController.postComment);

router.get('/:id/photos', authenticate, lobbyController.getPhotos);
router.post('/:id/photos', authenticate, upload.single('photo'), lobbyController.uploadPhoto);

module.exports = router;