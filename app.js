const express = require('express');
const path = require('path');
require('dotenv').config(); // Ortam değişkenlerini programın başında yükle
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); 
const i18n = require('./middleware/i18n'); // Import i18n middleware

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { requireAuth } = require('./middleware/authMiddleware');
const jobController = require('./controllers/jobController');

const app = express();

// Render motoru ayarları (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
// Yüklemelere doğrudan erişim (public/uploads klasörünün fiziksel olarak mevcut olduğundan emin olun)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// Oturumlar (Session) için veritabanı ayarları
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: process.env.SESSION_SECRET || 'change_me',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Normal HTTP (localhost) üzerinde false olmalıdır
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Global değişkenler (Locals) - Bu bölüm hayati önem taşır
app.use((req, res, next) => {
    // Değişkenlerin her zaman (boş olsa bile) tanımlandığından emin olmak için locals kullanımı
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.isLoggedIn; // Boolean'a dönüştür
    res.locals.path = req.path; // Adrese göre menüleri etkinleştirmek için
    next();
});

// i18n Middleware (Must be after session)
app.use(i18n);

// Ana Rotalar (Routes)
// Updated routes
app.get('/', jobController.getHome); 
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/auth', authRoutes);          
app.use('/jobs', jobRoutes);
app.use('/settings', requireAuth, settingsRoutes);           
app.use('/profile', profileRoutes);

app.get('/help', (req, res) => {
    console.log('GET /help');
    res.render('help', { pageTitle: 'Help & Support' });
});
app.get('/support', (req, res) => {
    console.log('GET /support');
    res.render('help', { pageTitle: 'Help & Support' });
});

// 404 Sayfası Yönetimi
app.use((req, res) => {
    if (req.headers['content-type'] === 'application/json' || req.headers['accept']?.includes('application/json')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        errorMessage: 'The path you are looking for does not exist.' 
    });
});

// Genel Hata Yönetimi (Global Error Handler)
// Bu bölüm, dahili bir hata durumunda beyaz ekran oluşmasını engeller
app.use((error, req, res, next) => {
    console.error("🔥 Server Error:", error);
    if (req.headers['content-type'] === 'application/json' || req.headers['accept']?.includes('application/json')) {
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
    res.status(500).send(`
        <h1>500 Internal Server Error</h1>
        <p>Something went wrong on the server.</p>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;">${error.stack}</pre>
    `);
});

const PORT = process.env.PORT || 3050;

// Export app for Vercel
module.exports = app;

// Only start server if run directly
if (require.main === module) {
    // Veritabanı senkronizasyonu ve sunucuyu başlatma
    sequelize.sync({ alter: false })
        .then(() => {
            console.log('✅ Database Synced');
            return sessionStore.sync(); 
        })
        .then(() => {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`✅ Server: http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error("❌ Database Error:", err);
        });
}
