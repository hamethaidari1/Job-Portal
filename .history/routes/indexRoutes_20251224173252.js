const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const jobRoutes = require('./jobRoutes'); // Job routeları buraya bağlanacak

// Ana Sayfa
router.get('/', mainController.getHome);

// /jobs ile başlayan istekleri jobRoutes'a yönlendir
router.use('/jobs', jobRoutes);

module.exports = router;