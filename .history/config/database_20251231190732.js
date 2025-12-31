// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,   // railway database name
  process.env.MYSQLUSER,       // railway mysql user
  process.env.MYSQLPASSWORD,   // railway mysql password
  {
    host: process.env.MYSQLHOST, // railway mysql host
    port: process.env.MYSQLPORT, // railway mysql port
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
