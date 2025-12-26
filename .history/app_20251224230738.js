const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, syncDatabase } = require('./models'); // Veritabanı bağlantısı

// Route Dosyalarını İçe Aktarma (Import Routes)
const authRoutes = require('./routes/authRoutes'); // 👈 اضافه شده

const app = express();

// 1. View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware - Statik Dosyalar ve Body Parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Form verilerini okumak için
app.use(express.json()); // JSON verilerini okumak için

// 3. Session Ayarları (MySQL üzerine kayıt)
const sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // Her 15 dakikada bir süresi dolanları temizle
    expiration: 24 * 60 * 60 * 1000 // Oturum süresi: 24 saat
});

app.use(session({
    secret: 'super_secret_key_job_portal', // Güvenlik anahtarı
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Localhost için false (Canlı sunucuda true olmalı)
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
app.use('/auth', authRoutes); // 👈 روت‌های احراز هویت فعال شدند

app.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Home' }); 
});

// 6. Server Başlatma
const PORT = process.env.PORT || 3050;

// Veritabanını senkronize et ve sunucuyu başlat
syncDatabase().then(() => {
    sessionStore.sync(); // Session tablosunu oluşturur
    app.listen(PORT, () => {
        console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
    });
});