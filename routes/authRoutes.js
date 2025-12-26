const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// مسیرها - نام توابع بعد از نقطه باید دقیقاً با کنترلر یکی باشد
router.get('/login', authController.getLogin);       // چک کنید نام getLogin درست باشد
router.post('/login', authController.postLogin);     // چک کنید نام postLogin درست باشد

router.get('/register', authController.getRegister); 
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);
router.get('/verify', authController.getVerify);
router.post('/verify/send', authController.sendVerifyCode);
router.post('/verify/confirm', authController.confirmVerifyCode);

module.exports = router;
