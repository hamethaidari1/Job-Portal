const { Job, Category } = require('../models');

exports.getHome = async (req, res) => {
    try {
        // En son eklenen 5 iş ilanını getir
        const recentJobs = await Job.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [Category]
        });

        res.render('index', { 
            user: req.session.user || undefined, 
            jobs: recentJobs 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};