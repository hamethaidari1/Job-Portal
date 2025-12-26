const { User, Profile } = require('../models');

exports.getProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    const user = await User.findByPk(req.session.user.id, {
        include: [{ model: Profile }]
    });
    if (!user) {
        return res.redirect('/auth/logout');
    }
    res.render('profile', {
        pageTitle: res.locals.t('header.profile'),
        user,
        profile: user.Profile || {}
    });
};

