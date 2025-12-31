// config/database.js
const Sequelize = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const dbHost = process.env.DB_HOST || 'localhost';

// Karar mekanizması:
// 1. Eğer DB_DIALECT 'sqlite' olarak ayarlanmışsa SQLite kullan.
// 2. Gerekli MySQL ortam değişkenleri eksikse SQLite'a otomatik geç.
// 3. Production ortamındaysak ve DB_HOST 'localhost' ise (harici DB yok), SQLite'a geç.
const hasMysqlEnv = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;
const useSqlite = process.env.DB_DIALECT === 'sqlite' || !hasMysqlEnv || (isProduction && dbHost === 'localhost');

let sequelize;

if (useSqlite) {
    console.log('⚠️ Production ortamında harici MySQL ayarı bulunamadı veya SQLite seçildi. SQLite veritabanı kullanılıyor...');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite', // Proje klasöründe dosya olarak saklanır
        logging: false
    });
} else {
    console.log('✅ MySQL veritabanı kullanılıyor...');
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            port: process.env.DB_PORT || 3306,
            logging: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

module.exports = sequelize;
