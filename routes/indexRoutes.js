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

module.exports = router;