const express = require('express');
const router = express.Router();

// صفحه اصلی
router.get('/', (req, res) => {
    try {
        // گرفتن اطلاعات کاربر از سشن (اگر لاگین کرده باشد)
        const user = req.session.user || null;

        res.render('home', { 
            title: 'Home - Job Portal',
            user: user // فرستادن اطلاعات کاربر به صفحه برای نمایش در منو
        });
    } catch (error) {
        console.error("Home Page Error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
});

module.exports = router;