const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش تمام شغل‌ها (همراه با جستجوی هوشمند)
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

// ۲. نمایش جزئیات کامل یک شغل
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

// ۳. نمایش داشبورد شخصی (فقط شغل‌های خود کاربر)
exports.getUserJobs = async (req, res) => {
    try {
        // امنیت: اگر سشن نپریده باشد اما یوزر نباشد
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

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

// ۴. نمایش فرم ثبت شغل جدید
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

// ۵. ثبت شغل جدید همراه با تصویر لوگو
exports.postCreateJob = async (req, res) => {
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
            userId: req.session.user ? req.session.user.id : null
        });
        res.redirect('/jobs/dashboard'); // بعد از ثبت به داشبورد هدایت شود بهتر است
    } catch (error) {
        console.error("Error in postCreateJob:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'Error saving job. Please check your inputs.',
            oldInput: { title, companyName, location, salary, description }
        });
    }
};

// ۶. نمایش فرم ویرایش
exports.getEditJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job || !req.session.user || String(job.userId) !== String(req.session.user.id)) {
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

// ۷. اعمال تغییرات ویرایش شده
exports.postEditJob = async (req, res) => {
    const jobId = req.params.id;
    const { title, companyName, location, jobType, salary, description } = req.body;
    
    try {
        const job = await Job.findByPk(jobId);

        if (!job || !req.session.user || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action.");
        }

        let updatedData = { 
            title, companyName, location, jobType, 
            salary: salary || 0, description 
        };

        if (req.file) {
            // حذف لوگوی قبلی برای بهینه‌سازی فضا
            if (job.companyLogo) {
                const oldPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) {}
                }
            }
            updatedData.companyLogo = req.file.filename;
        }

        await job.update(updatedData);
        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error("Error in postEditJob:", error);
        res.status(500).send("Error updating job.");
    }
};

// ۸. حذف کامل شغل و فایل تصویر آن
exports.postDeleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findByPk(jobId);
        
        if (!job || !req.session.user || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action.");
        }

        if (job.companyLogo) {
            const logoPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
            if (fs.existsSync(logoPath)) {
                try { fs.unlinkSync(logoPath); } catch (e) {}
            }
        }

        await job.destroy();
        res.redirect('/jobs/dashboard'); // بعد از حذف به داشبورد برگردد
    } catch (error) {
        console.error("Error in postDeleteJob:", error);
        res.status(500).send("Error deleting job.");
    }
};