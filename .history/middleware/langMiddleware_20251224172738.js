const fs = require('fs');
const path = require('path');

const locales = {
    tr: JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/tr.json'), 'utf-8')),
    en: JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/en.json'), 'utf-8'))
};

module.exports = (req, res, next) => {
    // Varsayılan dil Türkçe
    let lang = req.cookies.lang || 'tr';
    
    // Sözlüğü response locals'a ekle (View'lerde kullanmak için)
    res.locals.lang = lang;
    res.locals.t = locales[lang];
    next();
};