exports.postLogin = async (req, res) => {
    const { email, firebaseUid } = req.body;

    try {
        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            // بازگشت به صفحه لاگین با پیام خطا
            return res.render('auth/login', { 
                errorMessage: 'کاربر پیدا نشد. لطفا ابتدا ثبت‌نام کنید.', 
                pageTitle: 'Login' 
            });
        }

        // تنظیم اطلاعات سشن
        req.session.user = user;
        req.session.isLoggedIn = true;

        // ذخیره سشن و ریدایرکت قطعی
        req.session.save((err) => {
            if (err) console.log("Session Save Error:", err);
            return res.redirect('/'); 
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.render('auth/login', { errorMessage: 'خطای سرور.', pageTitle: 'Login' });
    }
};