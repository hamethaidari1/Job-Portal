const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش تمام شغل‌ها (عمومی - بدون نیاز به لاگین)
exports.getAllJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let whereClause = {};

        if (searchTerm) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchTerm}%` } },
                    { companyName: { [Op.like]: `%${searchTerm}%` } },
                    { location: { [Op.like]: `%${searchTerm}%` } }
                ]
            };
        }

        const jobs = await Job.findAll({ 
            where: whereClause, 
            order: [['createdAt', 'DESC']] 
        });
        
        res.render('index', { 
            jobs: jobs, 
            searchTerm: searchTerm,
            pageTitle: 'Home' 
        });
    } catch (error) {
        console.error("Error in getAllJobs:", error);
        res.status(500).send("Error fetching jobs");
    }
};

// ۲. نمایش جزئیات کامل یک شغل (عمومی)
exports.getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).render('404', { 
                pageTitle: 'Job Not Found',
                errorMessage: 'The job listing you are looking for does not exist.' 
            });
        }

        res.render('jobs/details', { 
            job: job,
            pageTitle: job.title 
        });
    } catch (error) {
        console.error("Error in getJobDetails:", error);
        res.status(500).send("Server Error");
    }
};

// ۳. نمایش داشبورد شخصی (نیازمند لاگین)
exports.getUserJobs = async (req, res) => {
    // بررسی امنیت سشن
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const jobs = await Job.findAll({
            where: { userId: req.session.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.render('jobs/dashboard', {
            pageTitle: 'My Dashboard',
            jobs: jobs
        });
    } catch (error) {
        console.error("Error in Dashboard:", error);
        res.status(500).send("Error loading dashboard");
    }
};

// ۴. نمایش فرم ثبت شغل جدید (نیازمند لاگین)
exports.getCreateJob = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    res.render('jobs/create', { 
        pageTitle: 'Post a New Job', 
        errorMessage: null,
        oldInput: { title: '', companyName: '', location: '', salary: '', description: '' }
    });
};

// ۵. ثبت شغل جدید (نیازمند لاگین)
exports.postCreateJob = async (req, res) => {
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.redirect('/auth/login');
    }

    const { title, companyName, location, jobType, salary, description } = req.body;
    const companyLogo = req.file ? req.file.filename : null;

    try {
        await Job.create({
            title, 
            companyName, 
            companyLogo, 
            location, 
            jobType, 
            salary: salary || 0,
            description,
            userId: req.session.user.id
        });
        res.redirect('/jobs/dashboard'); 
    } catch (error) {
        console.error("Error in postCreateJob:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'Error saving job. Please check your inputs.',
            oldInput: { title, companyName, location, salary, description }
        });
    }
};

// ۶. نمایش فرم ویرایش (نیازمند لاگین + مالکیت آگهی)
exports.getEditJob = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }

    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        // بررسی مالکیت: فقط صاحب آگهی اجازه دسترسی دارد
        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized: You do not own this job listing.");
        }

        res.render('jobs/edit', {
            job: job,
            pageTitle: 'Edit Job',
            errorMessage: null
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// ۷. اعمال تغییرات ویرایش شده (نیازمند لاگین + مالکیت آگهی)
exports.postEditJob = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }

    const jobId = req.params.id;
    const { title, companyName, location, jobType, salary, description } = req.body;
    
    try {
        const job = await Job.findByPk(jobId);

        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action.");
        }

        let updatedData = { 
            title, companyName, location, jobType, 
            salary: salary || 0, description 
        };

        if (req.file) {
            // حذف لوگوی قدیمی از حافظه برای جلوگیری از پر شدن هاست
            if (job.companyLogo) {
                const oldPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { console.error("File deletion failed", e); }
                }
            }
            updatedData.companyLogo = req.file.filename;
        }

        await job.update(updatedData);
        res.redirect(`/jobs/dashboard`); // بعد از ویرایش به داشبورد برگردد بهتر است
    } catch (error) {
        console.error("Error in postEditJob:", error);
        res.status(500).send("Error updating job.");
    }
};

// ۸. حذف کامل شغل (نیازمند لاگین + مالکیت آگهی)
exports.postDeleteJob = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }

    const jobId = req.params.id;
    try {
        const job = await Job.findByPk(jobId);
        
        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action.");
        }

        // حذف فیزیکی عکس لوگو
        if (job.companyLogo) {
            const logoPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
            if (fs.existsSync(logoPath)) {
                try { fs.unlinkSync(logoPath); } catch (e) { console.error("File deletion failed", e); }
            }
        }

        await job.destroy();
        res.redirect('/jobs/dashboard');
    } catch (error) {
        console.error("Error in postDeleteJob:", error);
        res.status(500).send("Error deleting job.");
    }
};