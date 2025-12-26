const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش تمام شغل‌ها (صفحه اصلی - هماهنگ با طرح جدید)
exports.getAllJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let whereClause = {};

        if (searchTerm) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchTerm}%` } },
                    { companyName: { [Op.like]: `%${searchTerm}%` } },
                    { location: { [Op.like]: `%${searchTerm}%` } },
                    { description: { [Op.like]: `%${searchTerm}%` } } // جستجو در توضیحات هم اضافه شد
                ]
            };
        }

        const jobs = await Job.findAll({ 
            where: whereClause, 
            order: [['createdAt', 'DESC']] 
        });
        
        // رندر کردن فایل index با متغیرهای مورد نیاز
        res.render('index', { 
            jobs: jobs || [], // ارسال آرایه خالی در صورت نبودن داده
            searchTerm: searchTerm,
            pageTitle: 'Home - Fiverr Clone' 
        });
    } catch (error) {
        console.error("❌ Error in getAllJobs:", error);
        // به جای صفحه سفید، یک آرایه خالی بفرستیم تا صفحه لود شود
        res.render('index', { 
            jobs: [], 
            searchTerm: '', 
            pageTitle: 'Home' 
        });
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