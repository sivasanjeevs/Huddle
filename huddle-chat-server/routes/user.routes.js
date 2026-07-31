const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/profiles', authenticate, userController.getAllProfiles);
router.post('/follow/:id', authenticate, userController.followUser);
router.post('/unfollow/:id', authenticate, userController.unfollowUser);

module.exports = router;
