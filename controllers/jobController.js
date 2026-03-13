const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// 1. Show Home Page
exports.getHome = async (req, res) => {
    try {
        // If user not logged in, show landing page
        if (!req.session.user) {
            return res.render('landing', {
                pageTitle: 'JobPortal - Find the best freelance services',
                path: '/',
                user: null
            });
        }

        const jobs = await Job.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 8 // Only 8 records for home page
        });
        
        res.render('index', { 
            jobs: jobs || [],
            searchTerm: '',
            pageTitle: 'Home - Fiverr Clone' 
        });
    } catch (error) {
        console.error("❌ Error in getHome:", error);
        res.render('index', { 
            jobs: [], 
            searchTerm: '', 
            pageTitle: 'Home' 
        });
    }
};

// 2. Show job list and search results
exports.getJobs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let whereClause = {};

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

        const jobs = await Job.findAll({ 
            where: whereClause, 
            order: [['createdAt', 'DESC']] 
        });
        
        res.render('jobs/index', { 
            jobs: jobs || [], 
            searchTerm: searchTerm,
            pageTitle: searchTerm ? `${res.locals.t('jobs.index.title')} - ${searchTerm}` : res.locals.t('jobs.index.title') 
        });
    } catch (error) {
        console.error("❌ Error in getJobs:", error);
        res.redirect('/');
    }
};

// 3. Show full details of a job
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

// 4. Show personal dashboard
exports.getUserJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { userId: req.session.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.render('jobs/dashboard', {
            pageTitle: res.locals.t('jobs.dashboard.title'),
            jobs: jobs
        });
    } catch (error) {
        console.error("❌ Error in Dashboard:", error);
        res.redirect('/');
    }
};

// 5. Show create job form
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { 
        pageTitle: res.locals.t('jobs.create.title'), 
        errorMessage: null,
        oldInput: { title: '', companyName: '', location: '', salary: '', description: '' }
    });
};

// 6. Save new job (with image management)
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
            pageTitle: res.locals.t('jobs.create.title'), 
            errorMessage: res.locals.t('jobs.common.error_saving') || 'Error saving job. Please try again.',
            oldInput: { title, companyName, location, salary, description }
        });
    }
};

// 7. Show edit form
exports.getEditJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);

        if (!job || String(job.userId) !== String(req.session.user.id)) {
            return res.status(403).send("Unauthorized access.");
        }

        res.render('jobs/edit', {
            job: job,
            pageTitle: res.locals.t('jobs.edit.title'),
            errorMessage: null
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// 8. Apply edited changes
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

// 9. İşi tamamen sil
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

// 10. İş Başvurusu (Application) İşlemi
exports.postApplyJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);
        
        if (!job) {
            return res.status(404).send('Job not found');
        }

        const { fullName, email, phone, coverLetter } = req.body;
        const cvFile = req.file; // Multer ile yüklenen dosya

        console.log('📝 New Application:', { fullName, email, phone, jobTitle: job.title });

        // E-posta gönderimi (Basit metin formatı)
        // Gerçek uygulamada CV'yi ek (attachment) olarak göndermelisiniz.
        // Burada şimdilik konsola yazdırıyoruz.
        
        // TODO: Send email to job poster (job.userId) or admin
        
        // Başvuru başarılı mesajı ile geri dön
        // Basit bir alert gösterip sayfaya geri dönebiliriz veya flash message kullanabiliriz.
        res.send(`
            <script>
                alert('${res.locals.t("jobs.application.success_message")}');
                window.location.href = '/jobs/${jobId}';
            </script>
        `);

    } catch (error) {
        console.error("❌ Application Error:", error);
        res.status(500).send("Application Failed");
    }
};
