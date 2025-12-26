const { Job } = require('../models');

// نمایش فرم ایجاد شغل
exports.getCreateJob = (req, res) => {
    // فقط اگر کاربر لاگین کرده باشد اجازه دارد
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    res.render('jobs/create', { pageTitle: 'Post a Job', user: req.session.user });
};

// ذخیره شغل در دیتابیس
exports.postCreateJob = async (req, res) => {
    const { title, description, companyName, location, jobType, salary } = req.body;

    try {
        await Job.create({
            title,
            description,
            companyName,
            location,
            jobType,
            salary,
            userId: req.session.user.id, // شناسه کاربری که لاگین کرده
            categoryId: 1 // فعلا موقت 1 می‌گذاریم تا بعدا دسته‌بندی بسازیم
        });

        res.redirect('/'); // بعد از ساخت موفق به خانه برگرد
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating job");
    }
};

// نمایش لیست شغل‌ها (برای صفحه اصلی)
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
        res.render('index', { 
            pageTitle: 'Home', 
            jobs: jobs, 
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.render('index', { pageTitle: 'Home', jobs: [], user: req.session.user });
    }
};