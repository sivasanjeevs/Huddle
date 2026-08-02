const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Define AI routes
router.post('/create-event', aiController.createEvent);
router.post('/summarize', aiController.summarize);
router.post('/extract-tasks', aiController.extractTasks);
router.post('/trip-plan', aiController.tripPlan);
router.post('/chat', aiController.chat);

module.exports = router;
