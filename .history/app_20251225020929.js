const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); // مستقیماً sequelize را ایمپورت می‌کنیم

// ایمپورت کردن روت‌ها و کنترلرها
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobController = require('./controllers/jobController');

const app = express();

// ۱. تنظیمات موتور قالب (EJS Setup)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ۲. ابزارهای میان‌بر (Middleware)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// ۳. تنظیمات سشن (Session)
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
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// ۴. متغیرهای سراسری برای استفاده در تمام EJS ها
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

// ۵. مسیرها (Routes)
app.get('/', jobController.getAllJobs); 
app.use('/auth', authRoutes);          
app.use('/jobs', jobRoutes);           

// ۶. مدیریت خطای ۴۰۴
app.use((req, res) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        errorMessage: 'The path you are looking for does not exist.' 
    });
});

// ۷. اجرای دیتابیس و سرور (اصلاح شده برای رفع خطای ستون ناموجود)
const PORT = process.env.PORT || 3050;

// استفاده از alter: true برای اضافه کردن ستون companyLogo به دیتابیس موجود
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database synchronized (Columns updated)');
        return sessionStore.sync(); 
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Database connection error:", err);
    });