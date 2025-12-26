const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotalar - Noktadan sonraki fonksiyon adları controller ile birebir aynı olmalıdır
router.get('/login', authController.getLogin);       // getLogin adının doğru olduğundan emin olun
router.post('/login', authController.postLogin);     // postLogin adının doğru olduğundan emin olun

router.get('/register', authController.getRegister); 
router.post('/register', authController.postRegister);

// Google Auth Route
router.post('/google', authController.postGoogleAuth);

router.get('/logout', authController.logout);
router.get('/verify', authController.getVerify);
router.post('/verify/send', authController.sendVerifyCode);
router.post('/verify/confirm', authController.confirmVerifyCode);

module.exports = router;
