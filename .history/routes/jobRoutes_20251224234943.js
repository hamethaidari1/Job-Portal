const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/create', jobController.getCreateJob);
router.post('/create', jobController.postCreateJob);
// داخل jobRoutes.js
router.get('/create', jobController.getCreateJobPage); // نمایش فرم
router.post('/', jobController.postNewJob);           // دریافت اطلاعات (POST /jobs)

router.get('/:id', jobController.getJobDetails); 

module.exports = router;