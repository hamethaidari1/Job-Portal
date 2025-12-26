const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// مسیرهای ثبت نام (Register)
router.get('/register', authController.getRegister);
router.post('/register', authController.register);

// مسیرهای ورود (Login)
router.get('/login', authController.getLogin);
router.post('/login', authController.login);

// مسیر خروج (Logout)
router.get('/logout', authController.logout);

module.exports = router;