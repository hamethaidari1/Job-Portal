const sequelize = require('./config/database');
const { User } = require('./models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Force sync just for User table to ensure columns exist
        await User.sync({ alter: true });
        console.log('User table synced.');

        // Describe table
        const [results, metadata] = await sequelize.query("DESCRIBE Users");
        console.log('Table Structure:', results);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

debug();