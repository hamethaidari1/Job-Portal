const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// مطمئن شوید که نام توابع بعد از authController درست تایپ شده باشد
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

module.exports = router;