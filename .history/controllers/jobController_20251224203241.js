// controllers/jobController.js
const { Job } = require('../models');

// نمایش همه شغل‌ها (برای صفحه اصلی شغل‌ها - بعداً تکمیلش می‌کنیم)
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
        res.render('jobs/index', { pageTitle: 'All Jobs', jobs: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// نمایش فرم "ثبت آگهی جدید"
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { 
        pageTitle: 'Post a New Job',
        errorMessage: null,
        user: req.session.user 
    });
};

// ذخیره آگهی در دیتابیس
exports.postCreateJob = async (req, res) => {
    try {
        const { title, companyName, location, salary, jobType, description } = req.body;

        // اعتبارسنجی ساده
        if (!title || !companyName || !description) {
            return res.render('jobs/create', { 
                pageTitle: 'Post a New Job',
                errorMessage: 'Please fill in all required fields.',
                user: req.session.user
            });
        }

        // ذخیره در دیتابیس
        await Job.create({
            title,
            companyName,
            location,
            salary,
            jobType,
            description
        });

        // بعد از ذخیره، برو به لیست شغل‌ها
        res.redirect('/jobs');

    } catch (error) {
        console.error("Create Job Error:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job',
            errorMessage: 'Error creating job: ' + error.message,
            user: req.session.user
        });
    }
};