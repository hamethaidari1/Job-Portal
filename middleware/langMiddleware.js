const { User } = require('../models'); // <--- Correct Path: Go up one folder (..), then to models

const translations = {
    en: {
        home: "Home",
        login: "Login",
        register: "Register",
        logout: "Logout",
        post_job: "Post Job",
        view_details: "View Details",
        apply: "Apply",
        search: "Search Jobs",
        no_jobs: "No jobs found.",
        posted_on: "Posted on"
    },
    tr: {
        home: "Ana Sayfa",
        login: "Giriş Yap",
        register: "Kayıt Ol",
        logout: "Çıkış Yap",
        post_job: "İlan Ver",
        view_details: "Detayları Gör",
        apply: "Başvur",
        search: "İş Ara",
        no_jobs: "Henüz ilan bulunamadı.",
        posted_on: "Yayınlanma tarihi"
    }
};

module.exports = async (req, res, next) => {
    // 1. Default to English or existing session language
    let lang = req.session.lang || 'en';

    // 2. Check if user clicked a language link (e.g., ?lang=tr)
    if (req.query.lang) {
        lang = req.query.lang;
        req.session.lang = lang;

        // (Optional) Save preference to database if logged in
        if (req.session.user) {
            try {
                await User.update({ language: lang }, { where: { id: req.session.user.id } });
            } catch (err) {
                console.error("Language save error:", err);
            }
        }
    }

    // 3. Make 't' variable available in all Views
    res.locals.t = translations[lang] || translations['en'];
    res.locals.lang = lang; 

    next();
};