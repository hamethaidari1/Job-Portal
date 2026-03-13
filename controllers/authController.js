const { User } = require('../models');
const crypto = require('crypto'); // Add Crypto module

/* =========================
   REGISTER
========================= */

// Show register form
exports.getRegister = (req, res) => {
    res.render('auth/register', {
        pageTitle: 'Register',
        errorMessage: null
    });
};

// Handle registration
exports.postRegister = async (req, res) => {
    console.log('📝 Register Request Body:', req.body); // Log incoming data
    const { email, role, password, confirmPassword } = req.body;

    try {
        // Simple validation
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
        }

        if (password !== confirmPassword) {
             throw new Error('Passwords do not match.');
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', {
                pageTitle: 'Register',
                errorMessage: 'User already exists.'
            });
        }

        // Role normalization (Very important)
        let normalizedRole = 'job_seeker';
        if (role === 'Employer' || role === 'employer') {
            normalizedRole = 'employer';
        }

        // Generate random ID for firebaseUid (Since Firebase is disabled in Backend)
        const firebaseUid = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        // Hash password (with simple SHA256)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Create user in database
        const user = await User.create({
            email,
            role: normalizedRole,
            isVerified: true,
            firebaseUid: firebaseUid,
            password: hashedPassword
        });

        // Save to session
        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            res.redirect('/profile');
        });

    } catch (error) {
        console.error('REGISTER ERROR 👉', error);
        res.render('auth/register', {
            pageTitle: 'Register',
            errorMessage: 'Database error: ' + error.message // Show error text
        });
    }
};

/* =========================
   LOGIN
========================= */

// Show login form
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: null
    });
};

// Handle login
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

        // Check password
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
   GOOGLE AUTH
========================= */

// Handle Google login/register
exports.postGoogleAuth = async (req, res) => {
    console.log('🔵 Google Auth Request:', req.body);
    try {
        const { email, firebaseUid, firstName, lastName } = req.body;

        if (!email || !firebaseUid) {
            return res.status(400).json({ error: 'Email and Firebase UID are required.' });
        }

        // Find or create user
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new user
            user = await User.create({
                email,
                role: 'job_seeker', // Default role
                isVerified: true, // Assume verified since coming from Google
                firebaseUid: firebaseUid,
                password: null // No password
            });
            
            // Create profile (Optional)
            try {
                const Profile = require('../models/Profile'); // Lazy load
                await Profile.create({
                    userId: user.id,
                    firstName: firstName || '',
                    lastName: lastName || ''
                });
            } catch (err) {
                console.error("Profile creation error:", err);
            }
        } else {
            // Update firebaseUid if existing user (if needed)
            if (user.firebaseUid !== firebaseUid) {
                await user.update({ firebaseUid: firebaseUid });
            }
        }

        // Save to session
        req.session.user = user;
        req.session.isLoggedIn = true;

        req.session.save(() => {
            return res.status(200).json({ success: true, redirect: '/profile' });
        });

    } catch (error) {
        console.error('GOOGLE AUTH ERROR 👉', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
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

/* Verification flow removed per request */
