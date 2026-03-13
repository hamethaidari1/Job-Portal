// seed.js - Special file to create categories
const { sequelize, Category } = require('./models');

const seedDatabase = async () => {
    try {
        await sequelize.sync(); // Connect to database

        // Check if categories exist, if not create them
        const count = await Category.count();
        if (count === 0) {
            await Category.bulkCreate([
                { name: 'IT & Software' },
                { name: 'Marketing' },
                { name: 'Design' },
                { name: 'Sales' },
                { name: 'Engineering' }
            ]);
            console.log('✅ Categories created successfully!');
        } else {
            console.log('ℹ️ Categories already exist.');
        }

        process.exit(); // Terminate program
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();