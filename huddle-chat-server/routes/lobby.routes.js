const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, lobbyController.createLobby);
router.get('/', authenticate, lobbyController.getLobbies);
router.get('/my-lobbies', authenticate, lobbyController.getMyLobbies);
router.post('/:id/join', authenticate, lobbyController.joinLobby);
router.get('/:id', authenticate, lobbyController.getLobbyById);
router.get('/:id/messages', authenticate, lobbyController.getLobbyMessages);
router.delete('/:id', authenticate, lobbyController.deleteLobby);

module.exports = router;