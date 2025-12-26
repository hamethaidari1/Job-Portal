// نمایش فرم ویرایش شغل
exports.getEditJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job || job.userId !== req.session.user.id) {
            return res.status(403).send("شما اجازه ویرایش این آگهی را ندارید.");
        }

        res.render('jobs/edit', {
            pageTitle: 'Edit Job',
            job: job,
            errorMessage: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("خطا در بارگذاری فرم ویرایش");
    }
};

// ثبت تغییرات ویرایش شده
exports.postEditJob = async (req, res) => {
    const jobId = req.params.id;
    const { title, companyName, location, jobType, salary, description } = req.body;

    try {
        const job = await Job.findByPk(jobId);

        if (!job || job.userId !== req.session.user.id) {
            return res.status(403).send("دسترسی غیرمجاز");
        }

        await job.update({
            title, companyName, location, jobType, salary, description
        });

        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("خطا در بروزرسانی آگهی");
    }
};

// حذف آگهی
exports.postDeleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findByPk(jobId);

        if (!job || job.userId !== req.session.user.id) {
            return res.status(403).send("دسترسی غیرمجاز برای حذف");
        }

        await job.destroy();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("خطا در حذف آگهی");
    }
};