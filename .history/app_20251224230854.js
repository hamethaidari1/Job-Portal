const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, syncDatabase } = require('./models'); 

// 👇 ایمپورت کردن روت‌ها و کنترلرها
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes'); // اضافه شد
const jobController = require('./controllers/jobController'); // اضافه شد

const app = express();

// 1. View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// 4. Global Variables (User info in views)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    next();
});

// 5. Routes
app.use('/auth', authRoutes); // روت‌های ورود و ثبت‌نام
app.use('/jobs', jobRoutes);  // روت‌های مربوط به شغل‌ها

// 👇 مهم: صفحه اصلی باید شغل‌ها را از دیتابیس بگیرد
app.get('/', jobController.getAllJobs); 

// 6. Start Server
const PORT = process.env.PORT || 3050;

syncDatabase().then(() => {
    sessionStore.sync(); 
    app.listen(PORT, () => {
        console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
    });
});