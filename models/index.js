const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');
const Category = require('./Category');
const Application = require('./Application');
const Profile = require('./Profile'); // 👈 Profil modeli eklendi

// İlişkileri Tanımlama (Defining Associations)

// User -> hasMany Jobs
User.hasMany(Job, { foreignKey: 'userId', onDelete: 'CASCADE' });
Job.belongsTo(User, { foreignKey: 'userId' });

// Category -> hasMany Jobs
Category.hasMany(Job, { foreignKey: 'categoryId' });
Job.belongsTo(Category, { foreignKey: 'categoryId' });

// User -> hasMany Applications
User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

// Job -> hasMany Applications
Job.hasMany(Application, { foreignKey: 'jobId', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// User -> hasOne Profile (Every user has one profile)
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });


// Database synchronization (STRONG RESET MODE)
const syncDatabase = async () => {
    try {
        // 1. First, disable Foreign Key checks (to avoid errors)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

        // 2. Force drop and recreate tables
        console.log('🔄 Resetting tables...');
        await sequelize.sync({ force: false }); 

        // 3. Re-enable Foreign Key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        console.log('✅ Database tables successfully reset and recreated.');
    } catch (error) {
        console.error('❌ Database error:', error);
    }
};

module.exports = {
    sequelize,
    syncDatabase,
    User,
    Job,
    Category,
    Application,
    Profile
};