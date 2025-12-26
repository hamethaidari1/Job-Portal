const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const multer = require('multer');
const path = require('path');

// Dosya depolama ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Sabit Rotalar (En üstte olmalı)
router.get('/search', jobController.getJobs);
router.get('/', jobController.getJobs);
router.get('/dashboard', jobController.getUserJobs);
router.get('/create', jobController.getCreateJob);
router.post('/create', upload.single('logo'), jobController.postCreateJob);

// Düzenleme ve Silme Rotaları
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', upload.single('logo'), jobController.postEditJob);
router.post('/delete/:id', jobController.postDeleteJob);

// Detay Görüntüleme Dinamik Rotası (Son rota)
router.get('/:id', jobController.getJobDetails);

module.exports = router;