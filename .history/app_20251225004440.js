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

// 1. View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/jobs', jobRoutes);
// 2. Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// 3. Session Settings
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

// 4. Global Variables (جلوگیری از ارور t و lang در فایل‌های EJS)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    
    // اضافه کردن متغیرهای زبان برای جلوگیری از کرش کردن ظاهر سایت
    res.locals.lang = req.session.lang || 'en';
    // یک آبجکت خالی برای t می‌سازیم تا اگر t.login صدا زده شد، ارور ندهد
    res.locals.t = {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        postJob: 'Post a Job'
    };
    next();
});

// 5. Routes
app.use('/auth', authRoutes); // مسیرهای /auth/login و /auth/register
app.use('/jobs', jobRoutes);  // مسیرهای مربوط به شغل‌ها (مثل /jobs/create)

// صفحه اصلی
app.get('/', jobController.getAllJobs); 

// 6. Error Handling (اگر مسیری پیدا نشد)
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><p>The path you are looking for does not exist.</p>');
});

// 7. Start Server
const PORT = process.env.PORT || 3050;

syncDatabase().then(() => {
    sessionStore.sync(); 
    app.listen(PORT, () => {
        console.log(`✅ Server is running: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("❌ Database connection error:", err);
});