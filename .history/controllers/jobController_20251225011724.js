const Job = require('../models/Job');
const { Op } = require('sequelize');

// ۱. نمایش تمام شغل‌ها
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

        const jobs = await Job.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
        
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

// حذف شغل
exports.postDeleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findByPk(jobId);
        
        // چک کردن اینکه آیا کاربر اجازه حذف دارد (فقط صاحب آگهی)
        if (job.userId !== req.session.user.id) {
            return res.status(403).send("Unauthorized action.");
        }

        await job.destroy();
        res.redirect('/'); // بعد از حذف به صفحه اصلی برگرد
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting job.");
    }
};
// ۲. نمایش فرم ثبت شغل
exports.getCreateJob = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    // نام فایل شما در اینجا باید با فایل فیزیکی (create.ejs) یکی باشد
    res.render('jobs/create', { 
        pageTitle: 'Post a New Job', 
        errorMessage: null 
    });
};

// ۳. ثبت شغل جدید
exports.postCreateJob = async (req, res) => {
    const { title, companyName, location, jobType, salary, description } = req.body;
    try {
        await Job.create({
            title, companyName, location, jobType, salary, description,
            userId: req.session.user ? req.session.user.id : null
        });
        res.redirect('/');
    } catch (error) {
        res.render('jobs/create', { 
            pageTitle: 'Post a New Job', 
            errorMessage: 'Error saving job.' 
        });
    }
};

// ۴. نمایش جزئیات شغل (اصلاح شده بر اساس نام فایل شما)
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

        // چون گفتی اسم فایلت details.ejs است، اینجا را اصلاح کردم:
        res.render('jobs/details', { 
            job: job,
            pageTitle: job.title 
        });

    } catch (error) {
        console.error("Error in getJobDetails:", error);
        res.status(500).send("Server Error");
    }
};