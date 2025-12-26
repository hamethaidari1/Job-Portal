const { Job, Category, User } = require('../models');

exports.listJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({ include: [Category, User] });
        res.render('jobs/list', { 
            jobs, 
            user: req.session.user 
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
            companyName: 'My Company', // Bu kısım dinamikleştirilebilir
            employerId: req.session.user.id
        });
        res.redirect('/jobs');
    } catch (error) {
        console.error(error);
        res.status(500).send("Job post error");
    }
};