// config/database.js
const Sequelize = require('sequelize');
require('dotenv').config();

// Sequelize bağlantısı oluşturuluyor
const sequelize = new Sequelize(
    process.env.DB_NAME || 'job_portal_updatedl',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Hamedrasa1212',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: false, // Konsol kirliliğini önlemek için
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            // This is important for some cloud databases (like Azure, AWS, etc.) if they require SSL
            // ssl: {
            //     require: true,
            //     rejectUnauthorized: false
            // }
        }
    }
);

module.exports = sequelize;