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
            categoryId: 1 // دسته‌بندی پیش‌فرض
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

// 👇 تابع جدید: نمایش جزئیات یک شغل خاص
exports.getJobDetails = async (req, res) => {
    const jobId = req.params.id; // دریافت ID از آدرس

    try {
        const job = await Job.findByPk(jobId); // پیدا کردن شغل در دیتابیس

        if (!job) {
            // اگر شغلی با این ID پیدا نشد
            return res.status(404).send('Job not found');
        }

        // نمایش فایل details.ejs
        res.render('jobs/details', { 
            pageTitle: job.title, 
            job: job, 
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching job details");
    }
};