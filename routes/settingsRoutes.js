const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const upload = require('../middleware/upload');

// GET /settings
router.get('/', settingsController.getSettings);

// POST /settings/profile
router.post('/profile', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), settingsController.updateProfile);

module.exports = router;
