const { User } = require('../models');

// نمایش صفحه ثبت نام
exports.getRegister = (req, res) => {
    // تغییر مهم: مسیر باید auth/register باشد
    res.render('auth/register', { 
        pageTitle: 'Register',
        errorMessage: null // نام متغیر باید با EJS هماهنگ باشد
    });
};

// انجام عملیات ثبت نام
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // چک کنیم ایمیل تکراری نباشد
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', { 
                pageTitle: 'Register',
                errorMessage: 'This email is already registered.' 
            });
        }

        // ساخت کاربر جدید
        await User.create({
            email,
            password, 
            role
        });

        // هدایت به صفحه لاگین
        res.redirect('/auth/login');
    } catch (error) {
        console.error("Registration Error:", error);
        res.render('auth/register', { 
            pageTitle: 'Register',
            errorMessage: 'Error: ' + error.message 
        });
    }
};

// نمایش صفحه لاگین
exports.getLogin = (req, res) => {
    // تغییر مهم: مسیر باید auth/login باشد
    res.render('auth/login', { 
        pageTitle: 'Login',
        errorMessage: null 
    });
};

// انجام عملیات لاگین
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. پیدا کردن کاربر با ایمیل
        const user = await User.findOne({ where: { email } });

        // 2. اگر کاربر پیدا نشد
        if (!user) {
            return res.render('auth/login', { 
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.' 
            });
        }

        // 3. چک کردن رمز عبور
        if (user.password !== password) {
            return res.render('auth/login', { 
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.' 
            });
        }

        // 4. ذخیره اطلاعات در سشن
        req.session.user = user;
        
        // 5. ذخیره سشن و رفتن به صفحه اصلی
        req.session.save(() => {
            res.redirect('/');
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.render('auth/login', { 
            pageTitle: 'Login',
            errorMessage: 'Server Error: ' + error.message 
        });
    }
};

// خروج از حساب (Logout)
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};