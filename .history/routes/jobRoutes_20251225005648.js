const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/create', jobController.getCreateJob);
router.post('/create', jobController.postCreateJob);
router.get('/:id', jobController.getJobDetails); // این خط برای View Details است

module.exports = router;