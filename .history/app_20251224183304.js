const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); 
const { sequelize } = require('./models');

// Middleware
const langMiddleware = require('./middleware/langMiddleware');

const app = express();

// View Engine Setup
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files (CSS/Images)
app.use(express.static(path.join(__dirname, 'public')));

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(session({
    secret: 'jobportal_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Custom Middleware (Language)
app.use(langMiddleware);

// Routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Database Sync & Start
// 👇 تغییر مهم: force: true یعنی دیتابیس قدیمی را پاک کن و جدید بساز
sequelize.sync({ force: true }).then(() => {
    console.log("✅ Database Connected & Reset (New Tables Created).");
    app.listen(3050, () => {
        console.log("🚀 Server running at http://localhost:3050");
    });
}).catch(err => {
    console.error("❌ Database Error:", err);
});