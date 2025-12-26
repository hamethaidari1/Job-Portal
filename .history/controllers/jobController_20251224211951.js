const { Job } = require('../models');
const { Op } = require('sequelize');

// نمایش همه شغل‌ها (با قابلیت جستجو)
exports.getAllJobs = async (req, res) => {
    try {
        const { search } = req.query;
        let whereCondition = {};

        if (search) {
            whereCondition = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { location: { [Op.like]: `%${search}%` } },
                    { companyName: { [Op.like]: `%${search}%` } }
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
            searchTerm: search 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// نمایش فرم ثبت آگهی
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { pageTitle: 'Post a New Job', errorMessage: null, user: req.session.user });
};

// ذخیره آگهی جدید
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

// نمایش جزئیات شغل
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

// 👇👇👇 توابع جدید برای ویرایش و حذف 👇👇👇

// ۱. نمایش فرم ویرایش
exports.getEditJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.redirect('/jobs');
        }
        res.render('jobs/edit', { 
            pageTitle: 'Edit Job', 
            job: job, 
            errorMessage: null,
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/jobs');
    }
};

// ۲. ذخیره تغییرات ویرایش
exports.postEditJob = async (req, res) => {
    try {
        const { title, companyName, location, salary, jobType, description } = req.body;
        await Job.update(
            { title, companyName, location, salary, jobType, description },
            { where: { id: req.params.id } }
        );
        res.redirect('/jobs/' + req.params.id); // برگشت به صفحه جزئیات همان شغل
    } catch (error) {
        console.error(error);
        res.redirect('/jobs');
    }
};

// ۳. حذف شغل
exports.postDeleteJob = async (req, res) => {
    try {
        await Job.destroy({ where: { id: req.params.id } });
        res.redirect('/jobs');
    } catch (error) {
        console.error(error);
        res.redirect('/jobs');
    }
};