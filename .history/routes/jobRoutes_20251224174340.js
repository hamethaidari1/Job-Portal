const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');

// İş İlanları Listesi (Arama & Filtreleme)
router.get('/', jobController.listJobs);

// İlan Ekleme Sayfası
router.get('/post', requireAuth, jobController.getPostJob);
router.post('/post', requireAuth, jobController.postJob);

// Tekil İlan Detayı (En alta koyun ki diğerleriyle çakışmasın)
router.get('/:id', jobController.getJobDetail);

module.exports = router;