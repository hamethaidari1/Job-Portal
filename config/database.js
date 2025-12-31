const Sequelize = require('sequelize');
require('dotenv').config();

const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
const hasUrl = Boolean(url);
const hasMysqlEnv = process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD;
const useSqlite = process.env.DB_DIALECT === 'sqlite' || (!hasUrl && !hasMysqlEnv);

let sequelize;

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  });
} else if (hasUrl) {
  sequelize = new Sequelize(url, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
    }
  );
}

module.exports = sequelize;
