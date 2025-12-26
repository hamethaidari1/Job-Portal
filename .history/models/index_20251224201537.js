const sequelize = require('../database'); // به فایل مرحله ۱ اشاره می‌کند
const User = require('./User');
const Job = require('./Job');

// تعریف روابط
User.hasMany(Job, { foreignKey: 'userId', onDelete: 'CASCADE' });
Job.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Job
};