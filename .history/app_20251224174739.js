const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // <--- NEW: Import Layouts
const { sequelize } = require('./models');

// Middleware
const langMiddleware = require('./middleware/langMiddleware');

const app = express();

// View Engine Setup
app.use(expressLayouts);                 // <--- NEW: Use Layouts
app.set('layout', 'layout');             // <--- NEW: Point to views/layout.ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
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

// Custom Middleware
app.use(langMiddleware);

// Routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Database Sync & Start
sequelize.sync({ force: false }).then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı.");
    app.listen(3050, () => {
        console.log("🚀 Sunucu http://localhost:3050 adresinde çalışıyor");
    });
}).catch(err => {
    console.error("❌ Veritabanı hatası:", err);
});