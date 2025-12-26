const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// روت‌های ثابت (Static)
router.get('/create', jobController.getCreateJob);
router.post('/create', jobController.postCreateJob);

// روت‌های داینامیک (Dynamic) - همیشه در انتها باشند
router.get('/:id', jobController.getJobDetails);

module.exports = router;