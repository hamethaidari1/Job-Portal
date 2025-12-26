const sequelize = require('../database'); // اتصال به فایلی که در مرحله ۱ ساختیم
const User = require('./User');
const Job = require('./Job');

// تعریف روابط (Relations)

// ۱. هر کاربر می‌تواند چندین آگهی داشته باشد
User.hasMany(Job, { 
    foreignKey: 'userId', 
    onDelete: 'CASCADE' 
});

// ۲. هر آگهی متعلق به یک کاربر است
Job.belongsTo(User, { 
    foreignKey: 'userId' 
});

module.exports = {
    sequelize,
    User,
    Job
};