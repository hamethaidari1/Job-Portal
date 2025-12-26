// config/database.js
const Sequelize = require('sequelize');

// Sequelize bağlantısı oluşturuluyor
const sequelize = new Sequelize('job_portal_updatedl', 'root', 'Hamedrasa1212', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Konsol kirliliğini önlemek için
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;