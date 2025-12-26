const { User } = require('../models');

// نمایش صفحه ثبت نام
exports.getRegister = (req, res) => {
    res.render('register', { error: null });
};

// انجام عملیات ثبت نام
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // چک کنیم ایمیل تکراری نباشد
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('register', { error: 'این ایمیل قبلاً ثبت شده است.' });
        }

        // ساخت کاربر جدید (فعلاً بدون هش کردن پسورد برای سادگی)
        await User.create({
            email,
            password, 
            role
        });

        // هدایت به صفحه لاگین
        res.redirect('/auth/login');
    } catch (error) {
        console.error("Registration Error:", error);
        res.render('register', { error: 'Registration Error: ' + error.message });
    }
};

// نمایش صفحه لاگین
exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

// انجام عملیات لاگین
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. پیدا کردن کاربر با ایمیل
        const user = await User.findOne({ where: { email } });

        // 2. اگر کاربر پیدا نشد
        if (!user) {
            return res.render('login', { error: 'کاربری با این ایمیل یافت نشد.' });
        }

        // 3. چک کردن رمز عبور (ساده)
        if (user.password !== password) {
            return res.render('login', { error: 'رمز عبور اشتباه است.' });
        }

        // 4. ذخیره اطلاعات در سشن (Session)
        req.session.user = user;
        
        // 5. ذخیره سشن و رفتن به صفحه اصلی
        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
};

// خروج از حساب (Logout)
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};