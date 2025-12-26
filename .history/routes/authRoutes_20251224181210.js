const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET Routes (Show Pages)
router.get('/login', (req, res) => res.render('auth/login'));
router.get('/register', (req, res) => res.render('auth/register'));
router.get('/verify', (req, res) => res.render('auth/verify'));

// POST Routes (Handle Actions)
router.post('/register', authController.register);
router.post('/verify-code', authController.verifyCode);
router.post('/login', authController.login); // <--- THIS WAS MISSING!

// Logout
router.get('/logout', authController.logout);

module.exports = router;