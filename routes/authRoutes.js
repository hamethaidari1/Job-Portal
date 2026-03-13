const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes - Function names after dot must match controller exactly
router.get('/login', authController.getLogin);       // Ensure getLogin name is correct
router.post('/login', authController.postLogin);     // Ensure postLogin name is correct

router.get('/register', authController.getRegister); 
router.post('/register', authController.postRegister);

// Google Auth Route
router.post('/google', authController.postGoogleAuth);

router.get('/logout', authController.logout);

module.exports = router;
