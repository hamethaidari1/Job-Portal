const { User, Profile } = require('../models');

/**
 * Kullanıcı profil sayfasını göster
 */
exports.getProfile = async (req, res) => {
    try {
        // 1. Kullanıcı oturumunu (Session) kontrol et
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        // 2. Kullanıcı bilgilerini ve profili veritabanından çek
        const user = await User.findByPk(req.session.user.id, {
            include: [{ model: Profile }]
        });

        // 3. Kullanıcı veritabanında yoksa (örn. silinmişse)
        if (!user) {
            return res.redirect('/auth/logout');
        }

        // 4. Profil ataması (Kayıt yoksa boş bir nesne ata)
        const profile = user.Profile || {};
        
        // 5. Puan listesini tanımla ve nihai puanı (Tamamlanma Skoru) hesapla
        let completionScore = 0;
        const breakdownList = [
            { key: 'name', score: 10, achieved: !!(profile.firstName && profile.lastName), labelKey: 'profile.breakdown.name' },
            { key: 'email', score: 10, achieved: !!(user.email), labelKey: 'profile.breakdown.email' },
            { key: 'picture', score: 15, achieved: !!(profile.profilePicture), labelKey: 'profile.breakdown.picture' },
            { key: 'skills', score: 20, achieved: !!(profile.skills && profile.skills.length > 0), labelKey: 'profile.breakdown.skills' },
            { key: 'experience', score: 20, achieved: !!(profile.experience && profile.experience.length > 0), labelKey: 'profile.breakdown.experience' },
            { key: 'cv', score: 25, achieved: !!(profile.cvPath), labelKey: 'profile.breakdown.cv' }
        ];

        // Kazanılan toplam puanı hesapla
        breakdownList.forEach(item => {
            if (item.achieved) completionScore += item.score;
        });

        // 6. EJS'de 500 hatasını önlemek için çeviri fonksiyonunu (t) güvenli hale getir
        // Çeviri sistemi aktif değilse anahtarı olduğu gibi döndür
        const t = (typeof res.locals.t === 'function') ? res.locals.t : ((key) => key);
        const lang = res.locals.lang || 'en';

        // 7. View'a gönderilecek yerel değişkenleri hazırla
        const locals = {
            pageTitle: t('header.profile'),
            user: user,
            profile: profile,
            completionScore: completionScore,
            breakdown: breakdownList,
            t: t,
            lang: lang
        };

        // 8. profile.ejs dosyasını render et
        return res.render('profile', locals);

    } catch (error) {
        // Hata ayıklama için terminale detaylı hatayı yazdır
        console.error('CRITICAL ERROR in getProfile Controller:', error);
        
        // Kullanıcıya sunucu hatasını göster
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
 * Profil bilgilerini JSON olarak al (Hata ayıklama veya API için)
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