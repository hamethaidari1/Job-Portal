// middleware/auth.js

// این تابع چک می‌کند که آیا کاربر لاگین است یا نه
exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        // اگر لاگین نبود، پرتش کن به صفحه لاگین
        return res.redirect('/auth/login');
    }
    // اگر لاگین بود، اجازه بده رد شود
    next();
};