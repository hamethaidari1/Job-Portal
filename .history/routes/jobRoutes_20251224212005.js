const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/auth');

// لیست شغل‌ها
router.get('/', jobController.getAllJobs);

// ساخت شغل جدید
router.get('/create', isAuthenticated, jobController.getCreateJob);
router.post('/create', isAuthenticated, jobController.postCreateJob);

// 👇 ویرایش شغل (قبل از /:id باشد)
router.get('/:id/edit', isAuthenticated, jobController.getEditJob);
router.post('/:id/edit', isAuthenticated, jobController.postEditJob);

// 👇 حذف شغل
router.post('/:id/delete', isAuthenticated, jobController.postDeleteJob);

// نمایش جزئیات (همیشه آخر باشد)
router.get('/:id', jobController.getJobDetails);

module.exports = router;