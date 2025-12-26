const Job = require('../models/Job');

// نمایش تمام شغل‌ها در صفحه اصلی
// نمایش جزئیات کامل یک شغل
exports.getJobDetails = async (req, res) => {
    const jobId = req.params.id; // گرفتن آیدی از آدرس (URL)
    try {
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).render('404', { pageTitle: 'Job Not Found' });
        }
        res.render('jobs/job-detail', { 
            job: job,
            pageTitle: job.title 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
// نمایش فرم ثبت شغل جدید
exports.getCreateJob = (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    
    // تغییر نام فایل از jobs/create-job به jobs/create
    res.render('jobs/create', { 
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