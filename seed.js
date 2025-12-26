// seed.js - Kategorileri oluşturmak için özel dosya
const { sequelize, Category } = require('./models');

const seedDatabase = async () => {
    try {
        await sequelize.sync(); // Veritabanına bağlan

        // Kategori yoksa, oluşturulup oluşturulmadığını kontrol et
        const count = await Category.count();
        if (count === 0) {
            await Category.bulkCreate([
                { name: 'IT & Software' },
                { name: 'Marketing' },
                { name: 'Design' },
                { name: 'Sales' },
                { name: 'Engineering' }
            ]);
            console.log('✅ Categories created successfully! (Kategoriler oluşturuldu)');
        } else {
            console.log('ℹ️ Categories already exist. (Zaten var)');
        }

        process.exit(); // Programı sonlandır
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();