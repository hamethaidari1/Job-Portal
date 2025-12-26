const { sequelize, Category } = require('./models');

const seedDatabase = async () => {
    try {
        await sequelize.sync(); // Veritabanını senkronize et

        const categories = [
            { name: 'Software Development' },
            { name: 'Data Science' },
            { name: 'Design & Creative' },
            { name: 'Marketing' },
            { name: 'Customer Service' }
        ];

        // Kategorileri topluca ekle
        await Category.bulkCreate(categories);
        console.log('✅ Kategoriler başarıyla eklendi!');
        process.exit();
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
};

seedDatabase();