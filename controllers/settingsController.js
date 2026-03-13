const { User, Profile } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id;
        
        // Get user with profile
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

        // Calculate Completion Score
        let completionScore = 0;
        // 1. Name (10%)
        if (profile.firstName && profile.lastName) completionScore += 10;
        // 2. Email (10%)
        if (user.email) completionScore += 10;
        // 3. Profile Picture (15%)
        if (profile.profilePicture) completionScore += 15;
        // 4. Skills (20%)
        if (profile.skills && profile.skills.length > 0) completionScore += 20;
        // 5. Experience (20%)
        if (profile.experience && profile.experience.length > 0) completionScore += 20;
        // 6. CV (25%)
        if (profile.cvPath) completionScore += 25;

        const t = typeof res.locals.t === 'function' ? res.locals.t : (key) => key;
        const lang = res.locals.lang || 'tr';
        res.render('settings', {
            pageTitle: t('settings.title'),
            user: user,
            profile: profile,
            completionScore: completionScore,
            activeTab: 'personal',
            successMessage: req.query.success ? 'Profile updated successfully' : null,
            errorMessage: req.query.error ? 'Error updating profile' : null,
            t,
            lang
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
        const { firstName, lastName, location, birthDate, skills, experience } = req.body;

        let profile = await Profile.findOne({ where: { userId } });
        if (!profile) {
            profile = await Profile.create({ userId });
        }

        const updateData = {
            firstName,
            lastName,
            location,
            birthDate: birthDate || null,
            skills,
            experience
        };

        if (req.files) {
            const isVercel = !!process.env.VERCEL;
            if (!isVercel) {
                if (req.files.profilePicture && req.files.profilePicture[0]?.filename) {
                    updateData.profilePicture = '/uploads/profiles/' + req.files.profilePicture[0].filename;
                }
                if (req.files.cv && req.files.cv[0]?.filename) {
                    updateData.cvPath = '/uploads/cvs/' + req.files.cv[0].filename;
                }
            }
        }

        await profile.update(updateData);

        // Update user name in session (to reflect instantly if used)
        // Just redirect for now
        res.redirect('/settings?success=true');
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.redirect('/settings?error=true');
    }
};
