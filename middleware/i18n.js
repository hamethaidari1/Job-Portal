const fs = require('fs');
const path = require('path');

// Load locales into memory to avoid reading file on every request
const locales = {
    en: JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/en.json'), 'utf-8')),
    tr: JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/tr.json'), 'utf-8'))
};

module.exports = (req, res, next) => {
    // 1. Check if user wants to switch language via query param
    if (req.query.lang && ['en', 'tr'].includes(req.query.lang)) {
        req.session.lang = req.query.lang;
        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            // Redirect to the same URL without the lang query param to clean it up
            const cleanUrl = req.originalUrl.split('?')[0];
            // Preserve other query params if any
            const otherParams = new URLSearchParams(req.query);
            otherParams.delete('lang');
            const queryString = otherParams.toString();
            
            return res.redirect(queryString ? `${cleanUrl}?${queryString}` : cleanUrl);
        });
        return; // Stop execution here to allow redirect
    }

    // 2. Determine current language
    // Priority: Session > Default (tr)
    const currentLang = req.session.lang || 'tr';
    
    // 3. Attach translation function and current language to res.locals
    res.locals.lang = currentLang;
    res.locals.t = (key) => {
        const keys = key.split('.');
        let value = locales[currentLang];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if key missing in current lang
                let fallback = locales['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found anywhere
                    }
                }
                return fallback;
            }
        }
        return value;
    };

    next();
};