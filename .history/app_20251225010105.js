const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, syncDatabase } = require('./models'); 

// ایمپورت کردن روت‌ها و کنترلرها
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobController = require('./controllers/jobController');

const app = express();

// ۱. تنظیمات موتور قالب (EJS Setup)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ۲. ابزارهای میان‌بر (Middleware) - باید قبل از روت‌ها باشند
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// ۳. تنظیمات سشن (Session) - بسیار مهم: باید قبل از روت‌های Job و Auth باشد
const sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, 
    expiration: 24 * 60 * 60 * 1000 
});

app.use(session({
    secret: 'super_secret_key_job_portal',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // در محیط لوکال روی false باشد
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// ۴. متغیرهای سراسری (Global Variables) - برای دسترسی در تمام فایل‌های EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    res.locals.lang = req.session.lang || 'en';
    res.locals.t = {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        postJob: 'Post a Job'
    };
    next();
});

// ۵. مسیرها (Routes) - حالا که سشن تعریف شده، روت‌ها به آن دسترسی دارند
app.get('/', jobController.getAllJobs); // صفحه اصلی
app.use('/auth', authRoutes);          // مسیرهای ورود و ثبت‌نام
app.use('/jobs', jobRoutes);           // مسیرهای ثبت و مدیریت شغل

// ۶. مدیریت خطای ۴۰۴ (اگر آدرسی پیدا نشد)
app.use((req, res) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        errorMessage: 'The path you are looking for does not exist.' 
    });
});

// ۷. اتصال به دیتابیس و اجرای سرور
// تغییر force: true به force: false
const syncDatabase = async () => {
   // ۷. Start Server
const PORT = process.env.PORT || 3050;

// فقط صدا زدن تابع (بدون تعریف دوباره)
syncDatabase().then(() => {
    sessionStore.sync(); 
    app.listen(PORT, () => {
        console.log(`✅ Server is running: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("❌ Database connection error:", err);
});