const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش صفحه اصلی (Home Page)
exports.getHome = async (req, res) => {
    try {
        // اگر کاربر لاگین نکرده باشد، صفحه لندینگ را نشان بده
        if (!req.session.user) {
            return res.render('landing', {
                pageTitle: 'JobPortal - Find the best freelance services',
                path: '/',
                user: null
            });
        }

        const jobs = await Job.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 8 // فقط ۸ تا برای صفحه اصلی
        });
        
        res.render('index', { 
            jobs: jobs || [],
            searchTerm: '',
            pageTitle: 'Home - Fiverr Clone' 
        });
    } catch (error) {
        console.error("❌ Error in getHome:", error);
        res.render('index', { 
            jobs: [], 
            searchTerm: '', 
            pageTitle: 'Home' 
        });
    }
};

// ۲. نمایش لیست شغل‌ها و نتایج جستجو (Search Results)
exports.getJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let whereClause = {};

        if (searchTerm) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchTerm}%` } },
                    { companyName: { [Op.like]: `%${searchTerm}%` } },
                    { location: { [Op.like]: `%${searchTerm}%` } },
                    { description: { [Op.like]: `%${searchTerm}%` } }
                ]
            };
        }

        const jobs = await Job.findAll({ 
            where: whereClause, 
            order: [['createdAt', 'DESC']] 
        });
        
        res.render('jobs/index', { 
            jobs: jobs || [], 
            searchTerm: searchTerm,
            pageTitle: searchTerm ? `Search Results for "${searchTerm}"` : 'All Jobs' 
        });
    } catch (error) {
        console.error("❌ Error in getJobs:", error);
        res.redirect('/');
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
        console.error("❌ Error in getJobDetails:", error);
        res.status(500).send("Server Error");
    }
};

// ۳. نمایش داشبورد شخصی
exports.getUserJobs = async (req, res) => {
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
        console.error("❌ Error in Dashboard:", error);
        res.redirect('/');
    }
};

// ۴. نمایش فرم ثبت شغل جدید
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { 
        pageTitle: 'Post a New Job', 
        errorMessage: null,
        oldInput: { title: '', companyName: '', location: '', salary: '', description: '' }
    });
};

// ۵. ثبت شغل جدید (با مدیریت بهتر تصویر)
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
            userId: req.session.user.id
        });
        res.redirect('/jobs/dashboard'); 
    } catch (error) {
        console.error("❌ Error in postCreateJob:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'Error saving job. Please try again.',
            oldInput: { title, companyName, location, salary, description }
        });
    }
};

// ۶. نمایش فرم ویرایش
exports.getEditJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);

        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized access.");
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

        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized.");
        }

        let updatedData = { 
            title, companyName, location, jobType, 
            salary: salary || 0, description 
        };

        if (req.file) {
            if (job.companyLogo) {
                const oldPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => { if (err) console.error(err); });
                }
            }
            updatedData.companyLogo = req.file.filename;
        }

        await job.update(updatedData);
        res.redirect(`/jobs/dashboard`);
    } catch (error) {
        console.error("❌ Error in postEditJob:", error);
        res.status(500).send("Error updating job.");
    }
};

// ۸. حذف کامل شغل
exports.postDeleteJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        
        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized.");
        }

        if (job.companyLogo) {
            const logoPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
            if (fs.existsSync(logoPath)) {
                fs.unlink(logoPath, (err) => { if (err) console.error(err); });
            }
        }

        await job.destroy();
        res.redirect('/jobs/dashboard');
    } catch (error) {
        console.error("❌ Error in postDeleteJob:", error);
        res.status(500).send("Error deleting job.");
    }
};