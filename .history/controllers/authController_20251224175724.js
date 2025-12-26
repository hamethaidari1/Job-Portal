const { User } = require('../models');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// REGISTER (Kayıt Ol)
exports.register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.send('<script>alert("Email already exists!"); window.location.href="/auth/register";</script>');
        }

        // Create new user (Simple text password for now to keep it easy)
        await User.create({ email, password, role: role || 'seeker' });
        
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send("Registration Error");
    }
};

// LOGIN (Giriş Yap)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = await User.findOne({ where: { email } });

        // Validate password (direct comparison for simplicity)
        if (!user || user.password !== password) {
            return res.send('<script>alert("Invalid email or password!"); window.location.href="/auth/login";</script>');
        }

        // ✅ SUCCESS: Save user to Session
        req.session.user = { id: user.id, email: user.email, role: user.role };
        
        req.session.save(() => {
            res.redirect('/'); // Go to Home Page
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Login Error");
    }
};

// LOGOUT
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// Verify (Code verification is skipped for simplicity now)
exports.verifyCode = (req, res) => {
    res.redirect('/');
};