const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Sayfası
router.get('/login', (req, res) => res.render('auth/login'));

// Register Sayfası
router.get('/register', (req, res) => res.render('auth/register'));

// Verify Sayfası
router.get('/verify', (req, res) => res.render('auth/verify'));

// API İşlemleri
router.post('/register', authController.register);
router.post('/verify-code', authController.verifyCode);

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;