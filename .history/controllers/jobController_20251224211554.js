const { Job } = require('../models');
const { Op } = require('sequelize'); // 👈 این خط برای جستجو مهم است

// نمایش همه شغل‌ها (با قابلیت جستجو)
exports.getAllJobs = async (req, res) => {
    try {
        const { search } = req.query; // کلمه جستجو شده را می‌گیریم
        let whereCondition = {};

        // اگر چیزی جستجو شده بود، شرط فیلتر را می‌سازیم
        if (search) {
            whereCondition = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },     // جستجو در عنوان
                    { location: { [Op.like]: `%${search}%` } },  // جستجو در شهر
                    { companyName: { [Op.like]: `%${search}%` } } // جستجو در نام شرکت
                ]
            };
        }

        const jobs = await Job.findAll({ 
            where: whereCondition,
            order: [['createdAt', 'DESC']] 
        });

        res.render('jobs/index', { 
            pageTitle: 'All Jobs', 
            jobs: jobs,
            user: req.session.user,
            searchTerm: search // کلمه جستجو شده را به ویو می‌فرستیم تا در اینپوت بماند
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// ... بقیه توابع (getCreateJob, postCreateJob, getJobDetails) بدون تغییر می‌مانند ...
// (حتماً مطمئن شوید بقیه توابع که قبلاً نوشتید اینجا باشند، من برای شلوغ نشدن اینجا نیاوردم)
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { pageTitle: 'Post a New Job', errorMessage: null, user: req.session.user });
};

exports.postCreateJob = async (req, res) => {
    try {
        const { title, companyName, location, salary, jobType, description } = req.body;
        if (!title || !companyName || !description) {
            return res.render('jobs/create', { pageTitle: 'Post a New Job', errorMessage: 'Please fill in all required fields.', user: req.session.user });
        }
        await Job.create({ title, companyName, location, salary, jobType, description });
        res.redirect('/jobs');
    } catch (error) {
        console.error("Create Job Error:", error);
        res.render('jobs/create', { pageTitle: 'Post a New Job', errorMessage: 'Error creating job: ' + error.message, user: req.session.user });
    }
};

exports.getJobDetails = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).render('404', { pageTitle: 'Job Not Found', path: '/jobs' });
        }
        res.render('jobs/show', { pageTitle: job.title, job: job, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};