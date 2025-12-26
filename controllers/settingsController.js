const { User, Profile } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id;
        
        // Fetch user with profile
        const user = await User.findByPk(userId, {
            include: [{ model: Profile }]
        });

        if (!user) {
            return res.redirect('/auth/logout');
        }

        // Ensure profile exists
        let profile = user.Profile;
        if (!profile) {
            profile = await Profile.create({ userId: user.id });
        }

        res.render('settings', {
            pageTitle: res.locals.t('settings.title'),
            user: user,
            profile: profile,
            activeTab: 'personal',
            successMessage: req.query.success ? 'Profile updated successfully' : null,
            errorMessage: req.query.error ? 'Error updating profile' : null
        });
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).send("Server Error");
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id;
        const { firstName, lastName, location, birthDate } = req.body;

        let profile = await Profile.findOne({ where: { userId } });
        if (!profile) {
            profile = await Profile.create({ userId });
        }

        await profile.update({
            firstName,
            lastName,
            location,
            birthDate: birthDate || null
        });

        // Update session user name for immediate reflection if we were using it
        // For now, just redirect
        res.redirect('/settings?success=true');
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.redirect('/settings?error=true');
    }
};
