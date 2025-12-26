const express = require('express');
const path = require('path');
require('dotenv').config(); // بارگذاری متغیرهای محیطی در ابتدای برنامه
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

// تنظیمات موتور رندر (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
// دسترسی مستقیم به آپلودها (دقت کنید پوشه public/uploads فیزیکی وجود داشته باشد)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// تنظیمات دیتابیس برای نشست‌ها (Session)
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: 'super_secret_key_job_portal',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // روی HTTP معمولی (localhost) باید false باشد
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// متغیرهای سراسری (Locals) - این بخش حیاتی است
app.use((req, res, next) => {
    // استفاده از locals برای اطمینان از اینکه متغیرها همیشه (حتی خالی) تعریف شده‌اند
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.isLoggedIn; // تبدیل به boolean
    res.locals.path = req.path; // برای فعال کردن منوها بر اساس آدرس
    next();
});

// i18n Middleware (Must be after session)
app.use(i18n);

// مسیرهای اصلی (Routes)
// Updated routes
app.get('/', jobController.getHome); 
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

// مدیریت صفحه 404
app.use((req, res) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        errorMessage: 'The path you are looking for does not exist.' 
    });
});

// مدیریت خطاهای کلی (Global Error Handler)
// این بخش از پرده سفید شدن در صورت بروز خطای داخلی جلوگیری می‌کند
app.use((error, req, res, next) => {
    console.error("🔥 Server Error:", error);
    res.status(500).send("Something went wrong on the server.");
});

const PORT = process.env.PORT || 3050;

// Export app for Vercel
module.exports = app;

// Only start server if run directly
if (require.main === module) {
    // هماهنگ‌سازی دیتابیس و اجرای سرور
    sequelize.sync({ alter: false })
        .then(() => {
            console.log('✅ Database Synced');
            return sessionStore.sync(); 
        })
        .then(() => {
            app.listen(PORT, () => {
                console.log(`✅ Server: http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error("❌ Database Error:", err);
        });
}
