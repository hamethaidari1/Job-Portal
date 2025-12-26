const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/', requireAuth, profileController.getProfile);
router.get('/debug', requireAuth, profileController.getProfileJson);

module.exports = router;
