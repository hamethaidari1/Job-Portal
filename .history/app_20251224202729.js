const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); 
const { sequelize } = require('./models');

// ایمپورت روت‌ها
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');

// ایمپورت میدل‌ور زبان
const langMiddleware = require('./middleware/langMiddleware');

const app = express();

// 1. تنظیمات فایل‌های استاتیک (CSS/Images)
app.use(express.static(path.join(__dirname, 'public')));

// 2. پارسرها (باید قبل از روت‌ها باشند)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. تنظیمات سشن (باید قبل از میدل‌ور یوزر باشد)
app.use(session({
    secret: 'jobportal_secret_key',
    resave: false,
    saveUninitialized: false
}));

// 4. تنظیمات ویو و لی‌اوت
app.use(expressLayouts);
app.set('layout', 'layout'); // اشاره به فایل views/layout.ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5. میدل‌ور مهم: ارسال اطلاعات کاربر به تمام صفحات (برای رفع ارور user is not defined)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // اگر کاربر لاگین بود اطلاعاتش را بفرست، اگر نه null
    next();
});

// 6. میدل‌ور زبان
app.use(langMiddleware);

// 7. تعریف روت‌ها (حتما باید بعد از تمام تنظیمات بالا باشند)
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);

// 8. اتصال به دیتابیس و روشن کردن سرور
// نکته: من force: true را به alter: true تغییر دادم تا اطلاعات ثبت‌نامی شما پاک نشود
sequelize.sync({ alter: true }).then(() => {
    console.log("✅ Database Connected.");
    app.listen(3050, () => {
        console.log("🚀 Server running at http://localhost:3050");
    });
}).catch(err => {
    console.error("❌ Database Error:", err);
});