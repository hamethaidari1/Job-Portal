const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/', requireAuth, profileController.getProfile);

module.exports = router;

