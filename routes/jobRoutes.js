const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const multer = require('multer');
const path = require('path');

// File storage settings
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

const cvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/cvs/';
        // Klasör yoksa oluştur
        const fs = require('fs');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'cv-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const uploadCv = multer({ storage: cvStorage });

// Edit and Delete Routes
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', upload.single('logo'), jobController.postEditJob);
router.post('/delete/:id', jobController.postDeleteJob);

// Başvuru Rotası
router.post('/:id/apply', uploadCv.single('cv'), jobController.postApplyJob);

// Detail View Dynamic Route (Last route)
router.get('/:id', jobController.getJobDetails);

module.exports = router;