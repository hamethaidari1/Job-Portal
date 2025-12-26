const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, syncDatabase } = require('./models'); // Veritabanı bağlantısı

const app = express();

// 1. View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware - Statik Dosyalar ve Body Parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Form verilerini okumak için
app.use(express.json()); // JSON verilerini okumak için

// 3. Session Ayarları (MySQL üzerine kayıt)
app.use(session({
    secret: 'super_secret_key_job_portal', // Güvenlik anahtarı
    store: new SequelizeStore({
        db: sequelize,
        checkExpirationInterval: 15 * 60 * 1000, // Her 15 dakikada bir süresi dolanları temizle
        expiration: 24 * 60 * 60 * 1000 // Oturum süresi: 24 saat
    }),
    resave: false,
    saveUninitialized: false, // Boş oturumları kaydetme
    cookie: {
        secure: false, // Localhost olduğu için false (HTTPS'de true olmalı)
        maxAge: 24 * 60 * 60 * 1000 // 1 gün
    }
}));

// 4. Global Değişkenler (Views içinde kullanıcıya erişmek için)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    next();
});

// 5. Routes (Yönlendirmeler)
// Şimdilik test rotası, sonra Auth ve Job rotalarını ekleyeceğiz
app.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Home' }); // Index view henüz yok, hata verebilir, aşağıda oluşturacağız.
});

// 6. Server Başlatma
const PORT = process.env.PORT || 3050;

syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Sunucu ve Session Store hazır: http://localhost:${PORT}`);
    });
});