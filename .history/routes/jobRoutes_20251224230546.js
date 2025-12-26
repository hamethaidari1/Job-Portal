const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// نمایش فرم
router.get('/create', jobController.getCreateJob);

// پردازش فرم
router.post('/create', jobController.postCreateJob);

module.exports = router;