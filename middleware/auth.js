// middleware/auth.js

// This function checks if user is logged in
exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        // If not logged in, redirect to login page
        return res.redirect('/auth/login');
    }
    // If logged in, allow access
    next();
};