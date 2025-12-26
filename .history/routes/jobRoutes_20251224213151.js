const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', jobController.getAllJobs);

router.get('/create', isAuthenticated, jobController.getCreateJob);
router.post('/create', isAuthenticated, jobController.postCreateJob);

router.get('/:id/edit', isAuthenticated, jobController.getEditJob);
router.post('/:id/edit', isAuthenticated, jobController.postEditJob);

// 👇👇 این خط بسیار مهم است 👇👇
router.post('/:id/delete', isAuthenticated, jobController.postDeleteJob);

router.get('/:id', jobController.getJobDetails);

module.exports = router;