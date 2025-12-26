const sequelize = require('../database'); // اتصال به دیتابیس اصلی
const User = require('./User');
const Job = require('./Job');

// تعریف روابط (Relations)

// ۱. هر کاربر می‌تواند چندین آگهی داشته باشد
User.hasMany(Job, { 
    foreignKey: 'userId', // نام ستون در جدول Job
    onDelete: 'CASCADE'   // اگر کاربر پاک شد، آگهی‌هایش هم پاک شوند
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