const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');

// İş İlanları Listesi
router.get('/', jobController.listJobs);

// İlan Ekleme Sayfası (Sadece giriş yapmış kullanıcılar)
router.get('/post', requireAuth, jobController.getPostJob);

// İlan Kaydetme (POST)
router.post('/post', requireAuth, jobController.postJob);

module.exports = router;