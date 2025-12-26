const Job = require('../models/Job');

// ۱. نمایش تمام شغل‌ها (مطمئن شوید نام این تابع getAllJobs است)
exports.getAllJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const jobs = await Job.findAll(); // در آینده می‌توانید اینجا فیلتر جستجو را اضافه کنید
        res.render('index', { 
            jobs: jobs, 
            searchTerm: searchTerm,
            pageTitle: 'Home' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching jobs");
    }
};

// ۲. نمایش فرم ثبت شغل
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { pageTitle: 'Post a New Job', errorMessage: null });
};

// ۳. ثبت شغل جدید
exports.postCreateJob = async (req, res) => {
    // کدهای ثبت شغل...
};

// ۴. نمایش جزئیات شغل
exports.getJobDetails = async (req, res) => {
    // کدهای جزئیات...
};