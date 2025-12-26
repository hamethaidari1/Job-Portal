const { Sequelize } = require('sequelize');

// اتصال به دیتابیس SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

module.exports = sequelize;