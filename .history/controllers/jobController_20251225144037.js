const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ۱. نمایش تمام شغل‌ها (همراه با جستجو)
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

// ۲. نمایش جزئیات کامل شغل
exports.getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).render('404', { 
                pageTitle: 'Job Not Found',
                errorMessage: 'Job not found.' 
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

// ۳. نمایش فرم ثبت شغل جدید
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

// ۴. ثبت شغل جدید همراه با لوگو
exports.postCreateJob = async (req, res) => {
    const { title, companyName, location, jobType, salary, description } = req.body;
    
    // ذخیره فقط نام فایل (بهتر است مسیر کامل را در ویو بسازیم)
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
        res.redirect('/');
    } catch (error) {
        console.error("Error in postCreateJob:", error);
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'Error saving job. Please check your inputs.',
            oldInput: { title, companyName, location, salary, description }
        });
    }
};

// ۵. نمایش فرم ویرایش شغل
exports.getEditJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        // بررسی مالکیت آگهی (تبدیل به String برای امنیت بیشتر در مقایسه)
        if (!job || !req.session.user || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action or Job not found.");
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

// ۶. اعمال تغییرات ویرایش شده
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
            // حذف لوگوی قدیمی برای جلوگیری از انباشته شدن فایل‌های بلااستفاده
            if (job.companyLogo) {
                const oldPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
                try {
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (err) {
                    console.log("Could not delete old file:", err.message);
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

// ۷. حذف شغل و لوگوی مربوطه
exports.postDeleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findByPk(jobId);
        
        if (!job || !req.session.user || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized action.");
        }

        if (job.companyLogo) {
            const logoPath = path.join(__dirname, '..', 'public', 'uploads', job.companyLogo);
            try {
                if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
            } catch (err) {
                console.log("File already deleted or not found.");
            }
        }

        await job.destroy();
        res.redirect('/'); 
    } catch (error) {
        console.error("Error in postDeleteJob:", error);
        res.status(500).send("Error deleting job.");
    }
};