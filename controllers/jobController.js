const Job = require('../models/Job');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 1. Ana sayfayı (Home Page) göster
exports.getHome = async (req, res) => {
    try {
        // Kullanıcı giriş yapmamışsa açılış (landing) sayfasını göster
        if (!req.session.user) {
            return res.render('landing', {
                pageTitle: 'JobPortal - Find the best freelance services',
                path: '/',
                user: null
            });
        }

        const jobs = await Job.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 8 // Ana sayfa için sadece 8 kayıt
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

// 2. İş listesini ve arama sonuçlarını (Search Results) göster
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

// 3. Bir işin tüm detaylarını göster
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

// 4. Kişisel paneli (Dashboard) göster
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

// 5. Yeni iş ilanı formunu göster
exports.getCreateJob = (req, res) => {
    res.render('jobs/create', { 
        pageTitle: res.locals.t('jobs.create.title'), 
        errorMessage: null,
        oldInput: { title: '', companyName: '', location: '', salary: '', description: '' }
    });
};

// 6. Yeni iş kaydet (Görsel yönetimi ile)
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

// 7. Düzenleme formunu göster
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

// 8. Düzenlenen değişiklikleri uygula
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
