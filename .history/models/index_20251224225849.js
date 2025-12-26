const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');
const Category = require('./Category');
const Application = require('./Application');

// İlişkileri Tanımlama (Defining Associations)

// Bir Kullanıcı (İşveren) birden fazla iş ilanı açabilir
// User -> hasMany Jobs
User.hasMany(Job, { foreignKey: 'userId', onDelete: 'CASCADE' });
Job.belongsTo(User, { foreignKey: 'userId' });

// Bir Kategori birden fazla iş ilanına sahip olabilir
// Category -> hasMany Jobs
Category.hasMany(Job, { foreignKey: 'categoryId' });
Job.belongsTo(Category, { foreignKey: 'categoryId' });

// Başvurular: Çoka çok ilişkiyi yönetmek yerine ara tablo kullanıyoruz
// User (İş Arayan) -> hasMany Applications
User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

// Job -> hasMany Applications
Job.hasMany(Application, { foreignKey: 'jobId', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// Veritabanı senkronizasyonu
const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // force: true tabloları silip yeniden oluşturur (Dikkat!)
        console.log('✅ Veritabanı tabloları başarıyla senkronize edildi.');
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
    Application
};