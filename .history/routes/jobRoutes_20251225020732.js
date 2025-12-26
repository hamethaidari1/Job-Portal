const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const multer = require('multer');
const path = require('path');

// تنظیمات ذخیره‌سازی فایل برای Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // مطمئن شو این پوشه در پروژه وجود دارد
    },
    filename: (req, file, cb) => {
        // نام فایل را منحصر به فرد می‌کنیم تا جایگزین فایل‌های قبلی نشود
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- روت‌های عملیاتی (عملیات قبل از نمایش) ---

// ثبت شغل جدید
router.get('/create', jobController.getCreateJob);
router.post('/create', upload.single('logo'), jobController.postCreateJob);

// ویرایش شغل
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', upload.single('logo'), jobController.postEditJob);

// حذف شغل
router.post('/delete/:id', jobController.postDeleteJob);

// --- روت‌های داینامیک (در انتها قرار بگیرند) ---

// نمایش جزئیات شغل
router.get('/:id', jobController.getJobDetails);

module.exports = router;