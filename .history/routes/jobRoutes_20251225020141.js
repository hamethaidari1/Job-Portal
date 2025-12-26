const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
router.post('/delete/:id', jobController.postDeleteJob);
// روت‌های ثابت (Static)
router.get('/create', jobController.getCreateJob);
router.post('/create', jobController.postCreateJob);
router.get('/edit/:id', jobController.getEditJob);
router.post('/edit/:id', jobController.postEditJob);
// روت‌های داینامیک (Dynamic) - همیشه در انتها باشند
router.get('/:id', jobController.getJobDetails);

module.exports = router;