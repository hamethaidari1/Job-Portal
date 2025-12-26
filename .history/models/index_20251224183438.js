const Sequelize = require('sequelize');
const path = require('path');

// تنظیمات دیتابیس SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // اسم فایل دیتابیس
    logging: false // برای تمیز شدن ترمینال
});

const db = {};

// ایمپورت کردن مدل‌ها
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// اتصال مدل‌ها به دیتابیس
db.User = require('./User')(sequelize, Sequelize);
db.Job = require('./Job')(sequelize, Sequelize); 

// تعریف روابط (Relations)
// هر کاربر (کارفرما) می‌تواند چندین شغل داشته باشد
db.User.hasMany(db.Job, { foreignKey: 'employerId' });
db.Job.belongsTo(db.User, { foreignKey: 'employerId' });

module.exports = db;