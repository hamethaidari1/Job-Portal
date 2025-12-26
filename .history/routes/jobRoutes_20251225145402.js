const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ۱. روت‌های ثابت (Static Routes) - همیشه بالا باشند
router.get('/dashboard', jobController.getUserJobs);
router.get('/create', jobController.getCreateJob);
router.post('/create', upload.single('logo'), jobController.postCreateJob);

// ۲. روت‌های پارامتریک با کلمات خاص
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', upload.single('logo'), jobController.postEditJob);
router.post('/delete/:id', jobController.postDeleteJob);

// ۳. روت داینامیک کل - همیشه آخرین روت باشد
router.get('/:id', jobController.getJobDetails);

module.exports = router;