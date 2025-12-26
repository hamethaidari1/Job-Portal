const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // <--- IMPORTANT: Import Layouts
const { sequelize } = require('./models');

// Middleware
const langMiddleware = require('./middleware/langMiddleware');

const app = express();

// View Engine Setup
app.use(expressLayouts);                 // <--- IMPORTANT: Enable Layouts
app.set('layout', 'layout');             // <--- IMPORTANT: Use views/layout.ejs
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

// Custom Middleware (Language)
app.use(langMiddleware);

// Routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
// const jobRoutes = require('./routes/jobRoutes'); // Uncomment this when you are ready for jobs

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
// app.use('/jobs', jobRoutes); // Uncomment this when you are ready for jobs

// Database Sync & Start
sequelize.sync({ force: false }).then(() => {
    console.log("✅ Database Connected.");
    app.listen(3050, () => {
        console.log("🚀 Server running at http://localhost:3050");
    });
}).catch(err => {
    console.error("❌ Database Error:", err);
});