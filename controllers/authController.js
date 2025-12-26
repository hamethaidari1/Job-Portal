const { User } = require('../models');
const { sendVerificationEmail } = require('../utils/mailer');
const crypto = require('crypto'); // اضافه کردن ماژول کریپتو

/* =========================
   REGISTER
========================= */

// نمایش فرم ثبت‌نام
exports.getRegister = (req, res) => {
    res.render('auth/register', {
        pageTitle: 'Register',
        errorMessage: null
    });
};

// پردازش ثبت‌نام
exports.postRegister = async (req, res) => {
    console.log('📝 Register Request Body:', req.body); // لاگ کردن اطلاعات دریافتی
    const { email, role, password, confirmPassword } = req.body;

    try {
        // اعتبارسنجی ساده
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
        }

        if (password !== confirmPassword) {
             throw new Error('Passwords do not match.');
        }

        // بررسی وجود کاربر
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', {
                pageTitle: 'Register',
                errorMessage: 'User already exists.'
            });
        }

        // نرمال‌سازی role (خیلی مهم)
        let normalizedRole = 'job_seeker';
        if (role === 'Employer' || role === 'employer') {
            normalizedRole = 'employer';
        }

        // ایجاد یک ID تصادفی به عنوان firebaseUid (چون فایربیس در بک‌اند غیرفعال است)
        const firebaseUid = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        // هش کردن رمز عبور (ساده با SHA256)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // ساخت کاربر در دیتابیس
        const user = await User.create({
            email,
            role: normalizedRole,
            isVerified: false,
            firebaseUid: firebaseUid,
            password: hashedPassword
        });

        // ذخیره در سشن
        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            res.redirect('/auth/verify');
        });

    } catch (error) {
        console.error('REGISTER ERROR 👉', error);
        res.render('auth/register', {
            pageTitle: 'Register',
            errorMessage: 'Database error: ' + error.message // نمایش متن خطا
        });
    }
};

/* =========================
   LOGIN
========================= */

// نمایش فرم ورود
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: null
    });
};

// پردازش ورود
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'User not found.'
            });
        }

        // بررسی رمز عبور
        if (password) {
             const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
             if (user.password && user.password !== hashedPassword) {
                return res.render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.'
                });
             }
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error('LOGIN ERROR 👉', error);
        res.render('auth/login', {
            pageTitle: 'Login',
            errorMessage: 'Server error.'
        });
    }
};

/* =========================
   LOGOUT
========================= */

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

/* =========================
   VERIFY EMAIL
========================= */

// نمایش صفحه Verify
exports.getVerify = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    res.render('auth/verify', {
        pageTitle: 'Verify Account',
        email: req.session.user.email,
        sent: false,
        errorMessage: null
    });
};

// ارسال کد تایید
exports.sendVerifyCode = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findByPk(req.session.user.id);
        if (!user) {
            return res.redirect('/auth/login');
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            verificationCode: code,
            verificationExpires: expires
        });

        console.log('🔐 VERIFICATION CODE:', code); // لاگ کردن کد برای دیباگ

        let emailErrorMsg = null;
        try {
            await sendVerificationEmail(user.email, code);
        } catch (err) {
            console.error('❌ Email Send Failed:', err);
            emailErrorMsg = 'Email sending failed (Check Console): ' + err.message;
        }

        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: user.email,
            sent: true, // فرم را همیشه نشان بده حتی اگر ایمیل فیل شد
            errorMessage: emailErrorMsg,
            successMessage: emailErrorMsg ? null : 'Verification code sent to your email.'
        });

    } catch (error) {
        console.error('SEND VERIFY CODE ERROR 👉', error);
        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: req.session.user.email,
            sent: false,
            errorMessage: 'Email Error: ' + error.message // نمایش دقیق خطا به کاربر
        });
    }
};

// تایید کد
exports.confirmVerifyCode = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const { code } = req.body;
        const user = await User.findByPk(req.session.user.id);

        if (!user || !user.verificationCode || !user.verificationExpires) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'No verification code found.'
            });
        }

        if (new Date(user.verificationExpires).getTime() < Date.now()) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'Verification code expired.'
            });
        }

        if (String(code) !== String(user.verificationCode)) {
            return res.render('auth/verify', {
                pageTitle: 'Verify Account',
                email: req.session.user.email,
                sent: true,
                errorMessage: 'Invalid verification code.'
            });
        }

        await user.update({
            isVerified: true,
            verificationCode: null,
            verificationExpires: null
        });

        req.session.user = user;

        req.session.save(() => {
            res.redirect('/settings');
        });

    } catch (error) {
        console.error('CONFIRM VERIFY ERROR 👉', error);
        res.render('auth/verify', {
            pageTitle: 'Verify Account',
            email: req.session.user.email,
            sent: true,
            errorMessage: 'Verification failed.'
        });
    }
};
