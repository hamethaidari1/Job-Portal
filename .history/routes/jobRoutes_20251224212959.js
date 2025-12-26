const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/auth');

// 1. نمایش لیست شغل‌ها
router.get('/', jobController.getAllJobs);

// 2. ساخت شغل جدید (ترتیب مهم: قبل از /:id)
router.get('/create', isAuthenticated, jobController.getCreateJob);
router.post('/create', isAuthenticated, jobController.postCreateJob);

// 3. ویرایش شغل (ترتیب مهم: قبل از /:id)
router.get('/:id/edit', isAuthenticated, jobController.getEditJob);
router.post('/:id/edit', isAuthenticated, jobController.postEditJob);

// 4. حذف شغل (ترتیب مهم: قبل از /:id)
router.post('/:id/delete', isAuthenticated, jobController.postDeleteJob);

// 5. نمایش جزئیات (حتماً باید آخرین روت باشد)
router.get('/:id', jobController.getJobDetails);

module.exports = router;