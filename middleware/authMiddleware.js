const { User } = require('../models');

const requireAuth = async (req, res, next) => {
    // Session check (Simple simulation, Firebase token should be posted to backend)
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const user = await User.findByPk(req.session.user.id);
    
    if (!user) {
        req.session.destroy();
        return res.redirect('/auth/login');
    }

    res.locals.user = user;
    next();
};

module.exports = { requireAuth };
