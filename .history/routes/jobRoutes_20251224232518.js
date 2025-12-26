const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/create', jobController.getCreateJob);
router.post('/create', jobController.postCreateJob);

// 👇 این خط جدید را اضافه کنید (مسیر دینامیک برای جزئیات شغل)
router.get('/:id', jobController.getJobDetails); 

module.exports = router;