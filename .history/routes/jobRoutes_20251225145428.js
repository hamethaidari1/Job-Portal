const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const multer = require('multer');
const path = require('path');

// تنظیمات ذخیره سازی فایل
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// روت‌های ثابت (بالاتر از همه)
router.get('/dashboard', jobController.getUserJobs);
router.get('/create', jobController.getCreateJob);
router.post('/create', upload.single('logo'), jobController.postCreateJob);

// روت‌های ویرایش و حذف
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', upload.single('logo'), jobController.postEditJob);
router.post('/delete/:id', jobController.postDeleteJob);

// روت داینامیک نمایش جزئیات (آخرین روت)
router.get('/:id', jobController.getJobDetails);

module.exports = router;