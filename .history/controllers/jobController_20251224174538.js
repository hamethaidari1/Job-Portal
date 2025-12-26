// NEW (Correct)
const { Op } = require('sequelize'); // Import Op directly from the package
const { Job, Category, User } = require('../models');
exports.listJobs = async (req, res) => {
    try {
        const { keyword, location, categoryId } = req.query;

        // Filtreleme Koşulları
        let whereClause = {};

        if (keyword) {
            whereClause.title = { [Op.like]: `%${keyword}%` };
        }
        if (location) {
            whereClause.location = { [Op.like]: `%${location}%` };
        }
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const jobs = await Job.findAll({
            where: whereClause,
            include: [Category, User],
            order: [['createdAt', 'DESC']]
        });

        const categories = await Category.findAll();

        res.render('jobs/list', { 
            jobs, 
            categories,
            user: req.session.user,
            query: req.query 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching jobs");
    }
};

exports.getPostJob = async (req, res) => {
    const categories = await Category.findAll();
    res.render('jobs/post', { 
        categories, 
        user: req.session.user 
    });
};

exports.postJob = async (req, res) => {
    const { title, description, categoryId, location, salary } = req.body;
    try {
        await Job.create({
            title,
            description,
            categoryId,
            location,
            salary,
            companyName: 'My Company', 
            employerId: req.session.user.id
        });
        res.redirect('/jobs');
    } catch (error) {
        console.error(error);
        res.status(500).send("Job post error");
    }
};

exports.getJobDetail = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id, {
            include: [Category, User]
        });
        
        if (!job) return res.status(404).send("Job not found");

        res.render('jobs/detail', { 
            job, 
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};