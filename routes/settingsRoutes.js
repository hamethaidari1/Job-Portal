const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET /settings
router.get('/', settingsController.getSettings);

// POST /settings/profile
router.post('/profile', settingsController.updateProfile);

module.exports = router;
