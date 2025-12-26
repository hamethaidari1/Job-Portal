const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); 

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobController = require('./controllers/jobController');

const app = express();

// تنظیمات موتور رندر (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public')));
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

// مسیرهای اصلی (Routes)
app.get('/', jobController.getAllJobs); 
app.use('/auth', authRoutes);          
app.use('/jobs', jobRoutes);           

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

// هماهنگ‌سازی دیتابیس و اجرای سرور
sequelize.sync({ alter: false }) // در حالت محصول بهتر است alter: false باشد
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