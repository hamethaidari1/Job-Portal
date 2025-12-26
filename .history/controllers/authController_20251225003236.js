const { User } = require('../models');

// ۱. نمایش فرم ثبت‌نام
exports.getRegister = (req, res) => {
    res.render('auth/register', { pageTitle: 'Register', errorMessage: null });
};

// ۲. نمایش فرم ورود
exports.getLogin = (req, res) => {
    res.render('auth/login', { pageTitle: 'Login', errorMessage: null });
};

// ۳. پردازش ثبت‌نام
exports.postRegister = async (req, res) => {
    const { email, firebaseUid, role } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.render('auth/register', { errorMessage: 'User already exists.', pageTitle: 'Register' });
        }
        user = await User.create({
            email,
            firebaseUid: firebaseUid || `temp_${Date.now()}`,
            role: role || 'job_seeker'
        });
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save(() => res.redirect('/'));
    } catch (error) {
        res.render('auth/register', { errorMessage: 'Database error.', pageTitle: 'Register' });
    }
};

// ۴. پردازش ورود
exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.render('auth/login', { errorMessage: 'User not found.', pageTitle: 'Login' });
        }
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save(() => res.redirect('/'));
    } catch (error) {
        res.render('auth/login', { errorMessage: 'Server error.', pageTitle: 'Login' });
    }
};

// ۵. خروج
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};