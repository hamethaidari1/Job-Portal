// config/database.js
const Sequelize = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const dbHost = process.env.DB_HOST || 'localhost';

// Karar mekanizması:
// 1. Eğer DB_DIALECT 'sqlite' olarak ayarlanmışsa SQLite kullan.
// 2. Veya, Production ortamındaysak (Render vb.) ve DB_HOST hala 'localhost' ise (yani dış bir veritabanı ayarlanmamışsa),
//    hata vermemesi için otomatik olarak SQLite'a geç.
const useSqlite = process.env.DB_DIALECT === 'sqlite' || (isProduction && dbHost === 'localhost');

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
        process.env.DB_NAME || 'job_portal_updatedl',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'Hamedrasa1212',
        {
            host: dbHost,
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
