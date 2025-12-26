const { Job } = require('../models');

// تابع نمایش صفحه اصلی
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll();
        res.render('index', { jobs: jobs });
    } catch (err) {
        res.status(500).send("Error fetching jobs");
    }
};

// تابع نمایش فرم ایجاد شغل
exports.getCreateJobPage = (req, res) => {
    res.render('jobs/create'); 
};

// تابع اصلی برای ذخیره شغل جدید (این بخش را حتما اضافه کنید)
exports.postNewJob = async (req, res) => {
    try {
        const { title, companyName, location, salary, jobType, description } = req.body;
        
        await Job.create({
            title,
            companyName,
            location,
            salary,
            jobType,
            description
        });

        res.redirect('/'); // بعد از ذخیره، برو به صفحه اصلی
    } catch (err) {
        console.error(err);
        res.status(500).send("خطا در ذخیره اطلاعات در دیتابیس");
    }
};

// نمایش جزئیات شغل
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (job) {
            res.render('jobs/detail', { job: job });
        } else {
            res.status(404).send("Job not found");
        }
    } catch (err) {
        res.status(500).send("Error");
    }
};