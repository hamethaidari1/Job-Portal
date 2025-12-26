const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models');

// Middleware
const langMiddleware = require('./middleware/langMiddleware');

const app = express();

// View Engine
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
// force: false -> Tablolar varsa silmez, yoksa oluşturur
sequelize.sync({ force: false }).then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı ve tablolar senkronize edildi.");
    app.listen(3050, () => {
        console.log("🚀 Sunucu http://localhost:3000 adresinde çalışıyor");
    });
}).catch(err => {
    console.error("❌ Veritabanı hatası:", err);
});