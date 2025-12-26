const Job = require('../models/Job');
const { Op } = require('sequelize');

// ۱. نمایش تمام شغل‌ها + قابلیت جستجو
exports.getAllJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let whereClause = {};

        // اگر جستجو انجام شده باشد، در دیتابیس فیلتر کن
        if (searchTerm) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchTerm}%` } },
                    { companyName: { [Op.like]: `%${searchTerm}%` } },
                    { location: { [Op.like]: `%${searchTerm}%` } }
                ]
            };
        }

        const jobs = await Job.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
        
        res.render('index', { 
            jobs: jobs, 
            searchTerm: searchTerm,
            pageTitle: 'Home - Available Jobs' 
        });
    } catch (error) {
        console.error("Error in getAllJobs:", error);
        res.status(500).send("Error fetching jobs");
    }
};

// ۲. نمایش فرم ثبت شغل
exports.getCreateJob = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    res.render('jobs/create', { 
        pageTitle: 'Post a New Job', 
        errorMessage: null 
    });
};

// ۳. ثبت شغل جدید در دیتابیس
exports.postCreateJob = async (req, res) => {
    const { title, companyName, location, jobType, salary, description } = req.body;
    try {
        await Job.create({
            title,
            companyName,
            location,
            jobType,
            salary,
            description,
            userId: req.session.user ? req.session.user.id : null
        });
        res.redirect('/');
    } catch (error) {
        console.error("Error in postCreateJob:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'مشکلی در ثبت اطلاعات رخ داد.' 
        });
    }
};

// ۴. نمایش کامل جزئیات یک شغل (حل مشکل لودینگ طولانی)
exports.getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).render('404', { 
                pageTitle: 'Job Not Found',
                errorMessage: 'شغل مورد نظر پیدا نشد.' 
            });
        }

        // نمایش فایل job-detail.ejs در پوشه views/jobs
        res.render('jobs/job-detail', { 
            job: job,
            pageTitle: job.title 
        });
    } catch (error) {
        console.error("Error in getJobDetails:", error);
        res.status(500).send("Server Error");
    }
};