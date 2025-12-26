const express = require('express');
const router = express.Router();
const { Job } = require('../models'); // ایمپورت مدل شغل

// 1. نمایش فرم ارسال آگهی (GET)
router.get('/new', (req, res) => {
    // اگر کاربر لاگین نکرده باشد، به صفحه لاگین برود
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('jobs/new', { user: req.session.user });
});

// 2. ذخیره آگهی در دیتابیس (POST)
router.post('/', async (req, res) => {
    try {
        // اگر کاربر لاگین نیست، اجازه ثبت نده
        if (!req.session.user) {
            return res.status(401).send('Please login first');
        }

        const { title, companyName, location, salary, jobType, description } = req.body;

        // ساخت آگهی جدید
        await Job.create({
            title,
            companyName,
            location,
            salary,
            jobType,
            description,
            userId: req.session.user.id // آیدی کسی که الان لاگین است
        });

        // بعد از ثبت موفق، برو به صفحه اصلی
        res.redirect('/');
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating job');
    }
});

module.exports = router;