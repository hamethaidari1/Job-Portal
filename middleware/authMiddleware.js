const { User } = require('../models');

const requireAuth = async (req, res, next) => {
    // Session kontrolü (Basit simülasyon, Firebase token backend'e post edilmeli)
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
