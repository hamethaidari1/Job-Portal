const { User } = require('../models');

// پردازش ورود (Login)
exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;

    try {
        // پیدا کردن کاربر بر اساس ایمیل
        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            // اگر کاربر پیدا نشد، پیام خطا در همان صفحه نشان داده شود
            return res.render('auth/login', { 
                errorMessage: 'کاربر پیدا نشد. لطفا ابتدا ثبت‌نام کنید.', 
                pageTitle: 'Login' 
            });
        }

        // بروزرسانی UID فایربیس اگر در فرم ارسال شده باشد
        if (firebaseUid && firebaseUid !== 'manual_login_token') {
            user.firebaseUid = firebaseUid;
            await user.save();
        }

        // ذخیره اطلاعات در سشن (Session)
        req.session.user = user;
        req.session.isLoggedIn = true;

        // ذخیره قطعی سشن قبل از ریدایرکت برای جلوگیری از پریدن لاگین
        req.session.save((err) => {
            if (err) {
                console.error("Session Save Error:", err);
                return res.redirect('/auth/login');
            }
            console.log(`✅ User logged in: ${user.email}`);
            return res.redirect('/'); 
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).render('auth/login', { 
            errorMessage: 'خطایی در سرور رخ داد. دوباره تلاش کنید.', 
            pageTitle: 'Login' 
        });
    }
};