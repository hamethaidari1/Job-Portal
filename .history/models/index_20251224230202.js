const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');
const Category = require('./Category');
const Application = require('./Application');
const Profile = require('./Profile'); // 👈 مدل پروفایل اضافه شد

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

// User -> hasOne Profile (هر کاربر یک پروفایل دارد)
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });


// Veritabanı senkronizasyonu (GÜÇLÜ SIFIRLAMA MODU)
const syncDatabase = async () => {
    try {
        // 1. Önce Foreign Key kontrolünü kapatıyoruz (Hata almamak için)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

        // 2. Tabloları zorla silip yeniden oluşturuyoruz
        console.log('🔄 Tablolar sıfırlanıyor...');
        await sequelize.sync({ force: false }); 

        // 3. Foreign Key kontrolünü tekrar açıyoruz
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        console.log('✅ Veritabanı tabloları başarıyla sıfırlandı ve yeniden oluşturuldu.');
    } catch (error) {
        console.error('❌ Veritabanı hatası:', error);
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