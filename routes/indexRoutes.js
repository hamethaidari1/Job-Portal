const express = require('express');
const router = express.Router();

// Ana Sayfa
router.get('/', (req, res) => {
    try {
        // Kullanıcı bilgilerini oturumdan al (eğer giriş yapmışsa)
        const user = req.session.user || null;

        res.render('home', { 
            title: 'Home - Job Portal',
            user: user // Kullanıcı bilgilerini menüde göstermek için sayfaya gönder
        });
    } catch (error) {
        console.error("Home Page Error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
});

// Debug Email Route
const { sendVerificationEmail } = require('../utils/mailer');
router.get('/debug-email', async (req, res) => {
    try {
        const email = req.session.user ? req.session.user.email : process.env.SMTP_USER;
        if (!email) {
            return res.send('No email to send to. Login or configure SMTP_USER.');
        }
        await sendVerificationEmail(email, '123456');
        res.send(`✅ Email sent to ${email}. Check your inbox.`);
    } catch (error) {
        res.status(500).send(`❌ Error: ${error.message}`);
    }
});

module.exports = router;