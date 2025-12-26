const { User } = require('../models');

// نمایش فرم ثبت‌نام
exports.getRegister = (req, res) => {
    res.render('auth/register', { pageTitle: 'Register', errorMessage: null });
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
            return res.status(400).render('auth/register', { 
                errorMessage: 'این ایمیل قبلاً ثبت شده است.',
                pageTitle: 'Register' 
            });
        }

        user = await User.create({
            email: email,
            firebaseUid: firebaseUid || `temp_${Date.now()}`, // جلوگیری از ارور Null
            role: role || 'job_seeker',
            isVerified: false
        });

        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            // اگر درخواست از نوع AJAX بود (برای Firebase)
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, redirectUrl: '/' });
            }
            res.redirect('/'); 
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.render('auth/register', { errorMessage: 'خطا در پایگاه داده.', pageTitle: 'Register' });
    }
};

// پردازش ورود
exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // اگر درخواست AJAX بود، JSON برگردان، در غیر این صورت صفحه را رندر کن
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ success: false, message: 'کاربر پیدا نشد.' });
            }
            return res.render('auth/login', { errorMessage: 'کاربری با این ایمیل یافت نشد.', pageTitle: 'Login' });
        }

        // بروزرسانی UID فایربیس در صورت نیاز
        if (firebaseUid && user.firebaseUid !== firebaseUid) {
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, redirectUrl: '/' });
            }
            res.redirect('/'); 
        });

    } catch (error) {
        console.error('Login Error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: 'خطای سرور' });
        }
        res.render('auth/login', { errorMessage: 'خطایی در سرور رخ داد.', pageTitle: 'Login' });
    }
};

// خروج
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};