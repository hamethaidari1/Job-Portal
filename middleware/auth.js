// middleware/auth.js

// Bu fonksiyon kullanıcının giriş yapıp yapmadığını kontrol eder
exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        // Eğer giriş yapmamışsa, giriş sayfasına yönlendir
        return res.redirect('/auth/login');
    }
    // Eğer giriş yapmışsa, geçişe izin ver
    next();
};