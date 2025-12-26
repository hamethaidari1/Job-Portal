const { User } = require('../models');

// نمایش فرم ثبت‌نام
exports.getRegister = (req, res) => {
    res.render('auth/register', { pageTitle: 'Register' });
};

// نمایش فرم ورود
exports.getLogin = (req, res) => {
    res.render('auth/login', { pageTitle: 'Login', errorMessage: null });
};

// پردازش ثبت‌نام
exports.postRegister = async (req, res) => {
    const { email, firebaseUid, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            // به جای فرستادن JSON، دوباره صفحه را با پیام خطا رندر می‌کنیم
            return res.render('auth/register', { errorMessage: 'User already exists.' });
        }

        user = await User.create({
            email: email,
            firebaseUid: firebaseUid,
            role: role || 'job_seeker',
            isVerified: false
        });

        req.session.user = user;
        req.session.isLoggedIn = true;

        // ذخیره سشن و هدایت به صفحه اصلی
        req.session.save(() => {
            res.redirect('/'); 
        });

    } catch (error) {
        console.error('MySQL Register Error:', error);
        res.render('auth/register', { errorMessage: 'Database error occurred.' });
    }
};

// پردازش ورود
exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // نمایش پیام خطا در همان صفحه لاگین به جای صفحه سیاه JSON
            return res.render('auth/login', { errorMessage: 'User not found in database.' });
        }

        if (firebaseUid && user.firebaseUid !== firebaseUid) {
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        // خیلی مهم: اول سشن را ذخیره کن، بعد ریدایرکت کن
        req.session.save(() => {
            res.redirect('/'); 
        });

    } catch (error) {
        console.error('MySQL Login Error:', error);
        res.render('auth/login', { errorMessage: 'Server error.' });
    }
};

// خروج
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.clearCookie('connect.sid'); // پاک کردن کوکی مرورگر
        res.redirect('/');
    });
};