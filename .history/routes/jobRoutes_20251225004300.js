const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// نمایش فرم ثبت شغل جدید
// GET: http://localhost:3050/jobs/create
router.get('/create', jobController.getCreateJob);

// دریافت اطلاعات فرم و ذخیره در دیتابیس
// POST: http://localhost:3050/jobs/create
router.post('/create', jobController.postCreateJob);

module.exports = router;