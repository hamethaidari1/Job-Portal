const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/auth'); // ایمپورت نگهبان

// نمایش لیست شغل‌ها
router.get('/', jobController.getAllJobs);

// نمایش فرم ثبت آگهی (فقط برای لاگین شده‌ها)
router.get('/create', isAuthenticated, jobController.getCreateJob);

// دریافت اطلاعات فرم و ذخیره (فقط برای لاگین شده‌ها)
router.post('/create', isAuthenticated, jobController.postCreateJob);

module.exports = router;