const { User, Profile } = require('../models');

/**
 * Show user profile page
 */
exports.getProfile = async (req, res) => {
    try {
        // 1. Check user session
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        // 2. Fetch user info and profile from database
        const user = await User.findByPk(req.session.user.id, {
            include: [{ model: Profile }]
        });

        // 3. If user not in database (e.g. deleted)
        if (!user) {
            return res.redirect('/auth/logout');
        }

        // 4. Assign profile (Assign empty object if no record)
        const profile = user.Profile || {};
        
        // 5. Define score list and calculate final score (Completion Score)
        let completionScore = 0;
        const breakdownList = [
            { key: 'name', score: 10, achieved: !!(profile.firstName && profile.lastName), labelKey: 'profile.breakdown.name' },
            { key: 'email', score: 10, achieved: !!(user.email), labelKey: 'profile.breakdown.email' },
            { key: 'picture', score: 15, achieved: !!(profile.profilePicture), labelKey: 'profile.breakdown.picture' },
            { key: 'skills', score: 20, achieved: !!(profile.skills && profile.skills.length > 0), labelKey: 'profile.breakdown.skills' },
            { key: 'experience', score: 20, achieved: !!(profile.experience && profile.experience.length > 0), labelKey: 'profile.breakdown.experience' },
            { key: 'cv', score: 25, achieved: !!(profile.cvPath), labelKey: 'profile.breakdown.cv' }
        ];

        // Calculate total earned score
        breakdownList.forEach(item => {
            if (item.achieved) completionScore += item.score;
        });

        // 6. Make translation function (t) safe to prevent 500 error in EJS
        // If translation system not active, return key as is
        const t = (typeof res.locals.t === 'function') ? res.locals.t : ((key) => key);
        const lang = res.locals.lang || 'en';

        // 7. Prepare local variables to send to View
        const locals = {
            pageTitle: t('header.profile'),
            user: user,
            profile: profile,
            completionScore: completionScore,
            breakdown: breakdownList,
            t: t,
            lang: lang
        };

        // 8. Render profile.ejs
        return res.render('profile', locals);

    } catch (error) {
        // Print detailed error to terminal for debugging
        console.error('CRITICAL ERROR in getProfile Controller:', error);
        
        // Show server error to user
        return res.status(500).send(`
            <div style="padding: 20px; font-family: sans-serif;">
                <h2 style="color: #d9534f;">Server Error (500)</h2>
                <p><strong>Message:</strong> ${error.message}</p>
                <hr>
                <p>Please check your terminal for more details.</p>
            </div>
        `);
    }
};

/**
 * Get profile info as JSON (For debugging or API)
 */
exports.getProfileJson = async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });

        const user = await User.findByPk(req.session.user.id, {
            include: [{ model: Profile }]
        });
        
        const profile = (user && user.Profile) ? user.Profile : {};
        let completionScore = 0;
        
        const breakdownList = [
            { key: 'name', achieved: !!(profile.firstName && profile.lastName) },
            { key: 'email', achieved: !!(user && user.email) },
            { key: 'picture', achieved: !!(profile.profilePicture) }
        ];

        breakdownList.forEach(item => { if (item.achieved) completionScore += 10; });

        return res.json({
            success: true,
            userId: user ? user.id : null,
            completionScore,
            data: { user, profile }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};