const Job = require('../models/Job');

// نمایش تمام شغل‌ها در صفحه اصلی
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll();
        res.render('index', { 
            jobs: jobs,
            pageTitle: 'Home - Available Jobs'
        });
    } catch (error) {
        console.error("Fetch Jobs Error:", error);
        res.status(500).send("Error fetching jobs from database.");
    }
};

// نمایش فرم ثبت شغل جدید
exports.getCreateJob = (req, res) => {
    // امنیت: فقط کاربران لاگین شده بتوانند شغل پست کنند
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    res.render('jobs/create-job', { 
        pageTitle: 'Post a New Job',
        errorMessage: null 
    });
};

// دریافت دیتای فرم و ذخیره در دیتابیس
exports.postCreateJob = async (req, res) => {
    const { title, companyName, location, jobType, salary, description } = req.body;
    
    try {
        await Job.create({
            title,
            companyName,
            location,
            jobType,
            salary,
            description,
            // وصل کردن شغل به کاربری که فعلاً لاگین است
            userId: req.session.user ? req.session.user.id : null
        });
        
        // بعد از موفقیت، به صفحه اصلی برگرد
        res.redirect('/'); 
    } catch (error) {
        console.error("Create Job Error:", error);
        res.render('jobs/create-job', { 
            errorMessage: 'مشکلی در ثبت شغل به وجود آمد. لطفاً دوباره تلاش کنید.',
            pageTitle: 'Post a New Job'
        });
    }
};