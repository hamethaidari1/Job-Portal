const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش تمام شغل‌ها و مدیریت جستجو (صفحه اصلی)
exports.getAllJobs = async (req, res) => {
    try {
        // ۱. بررسی وضعیت لاگین: اگر کاربر وارد نشده، صفحه لندینگ را نشان بده
        if (!req.session.isLoggedIn) {
            return res.render('landing', {
                pageTitle: 'İŞBUL.ONLINE - Find the best freelance services',
                path: '/'
            });
        }

        // ۲. دریافت کلمه جستجو شده از URL (مثلاً ?search=ios)
        const searchTerm = req.query.search || '';
        let whereClause = {};

        // ۳. ساخت شرط جستجو در دیتابیس (اگر کلمه‌ای تایپ شده باشد)
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

        // ۴. دریافت لیست شغل‌ها بر اساس فیلتر جستجو
        const jobs = await Job.findAll({ 
            where: whereClause, 
            order: [['createdAt', 'DESC']] 
        });
        
        // ۵. رندر کردن صفحه اصلی (index) با نتایج
        res.render('index', { 
            jobs: jobs || [],
            searchTerm: searchTerm, // ارسال کلمه جستجو شده برای نمایش در باکس سرچ
            pageTitle: searchTerm ? `Results for "${searchTerm}"` : 'Home - İŞBUL.ONLINE'
        });

    } catch (error) {
        console.error("❌ Error in getAllJobs:", error);
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

// ۳. نمایش داشبورد شخصی کاربر (شغل‌هایی که خودش پست کرده)
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

// ۵. ثبت شغل جدید در دیتابیس
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

// ۶. نمایش فرم ویرایش شغل
exports.getEditJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);

        // امنیت: فقط صاحب شغل بتواند آن را ویرایش کند
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

// ۷. ذخیره تغییرات ویرایش شده
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

        // مدیریت تصویر جدید و پاک کردن تصویر قدیمی
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

// ۸. حذف شغل و فایل تصویر آن
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