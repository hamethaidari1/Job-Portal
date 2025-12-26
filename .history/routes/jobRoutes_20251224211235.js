const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/auth'); // ایمپورت نگهبان

// 1. نمایش لیست همه شغل‌ها
router.get('/', jobController.getAllJobs);

// 2. نمایش فرم ثبت آگهی (حتما باید قبل از /:id باشد)
router.get('/create', isAuthenticated, jobController.getCreateJob);

// 3. دریافت اطلاعات فرم و ذخیره
router.post('/create', isAuthenticated, jobController.postCreateJob);

// 4. نمایش جزئیات یک شغل (این خط جدید است)
// نکته: این خط باید حتماً آخر لیست باشد
router.get('/:id', jobController.getJobDetails);

module.exports = router;