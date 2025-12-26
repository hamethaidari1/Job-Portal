// controllers/authController.js
const { User } = require('../models');

// نمایش فرم ثبت‌نام
exports.getRegister = (req, res) => {
    res.render('auth/register', { pageTitle: 'Register', user: req.session.user });
};

// نمایش فرم ورود
exports.getLogin = (req, res) => {
    res.render('auth/login', { pageTitle: 'Login', user: req.session.user });
};

// پردازش ثبت‌نام (ذخیره در MySQL بعد از موفقیت در Firebase)
exports.postRegister = async (req, res) => {
    const { email, firebaseUid, role } = req.body;

    try {
        // چک کنیم کاربر قبلاً نباشد
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists in database.' });
        }

        // ساخت کاربر جدید در MySQL
        user = await User.create({
            email: email,
            firebaseUid: firebaseUid,
            role: role || 'job_seeker', // پیش‌فرض: کارجو
            isVerified: false
        });

        // ذخیره در سشن
        req.session.user = user;
        req.session.isLoggedIn = true;

        res.json({ success: true, redirectUrl: '/' });

    } catch (error) {
        console.error('MySQL Register Error:', error);
        res.status(500).json({ success: false, message: 'Database error occurred.' });
    }
};

// پردازش ورود
exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in database.' });
        }

        // آپدیت کردن Firebase UID اگر تغییر کرده باشد (اختیاری)
        if (user.firebaseUid !== firebaseUid) {
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        res.json({ success: true, redirectUrl: '/' });

    } catch (error) {
        console.error('MySQL Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// خروج
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};