const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); 
const { Op } = require('sequelize'); 
const Job = require('./models/Job');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobController = require('./controllers/jobController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: 'super_secret_key_job_portal',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// متغیرهای سراسری برای تمام فایل‌های EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    next();
});

// مسیرهای اصلی
app.get('/', jobController.getAllJobs); 
app.use('/auth', authRoutes);          
app.use('/jobs', jobRoutes);           

app.use((req, res) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        errorMessage: 'The path you are looking for does not exist.' 
    });
});

const PORT = process.env.PORT || 3050;

// هماهنگ‌سازی دیتابیس و اجرای پاکسازی قطعی
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database Synced');
        
        // حذف تمام آگهی‌های بدون صاحب یا تستی (مثل Hello World)
        return Job.destroy({ 
            where: { 
                [Op.or]: [
                    { userId: null },
                    { title: 'hello world' }
                ]
            } 
        });
    })
    .then((deletedCount) => {
        if (deletedCount > 0) {
            console.log(`🧹 Cleanup: ${deletedCount} broken/test jobs removed.`);
        } else {
            console.log('🧹 Cleanup: No broken jobs found.');
        }
        return sessionStore.sync(); 
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Database Error:", err);
    });