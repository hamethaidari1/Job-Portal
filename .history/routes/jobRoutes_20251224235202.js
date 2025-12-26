const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// مسیر نمایش فرم ایجاد شغل
router.get('/create', jobController.getCreateJobPage);

// مسیر دریافت اطلاعات از فرم و ذخیره در دیتابیس (این بخش اضافه شود)
router.post('/', jobController.postNewJob); 

// مسیر نمایش جزئیات یک شغل
router.get('/:id', jobController.getJobById);

module.exports = router;