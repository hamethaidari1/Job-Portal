const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'İlan başlığı'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'İş tanımı ve detaylar'
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Şirket adı'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'İş konumu (Şehir/İlçe)'
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Maaş aralığı (Opsiyonel)'
    },
    jobType: {
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Remote', 'Freelance'),
        allowNull: false,
        comment: 'Çalışma şekli'
    },
    status: {
        type: DataTypes.ENUM('active', 'closed'),
        defaultValue: 'active',
        comment: 'İlan durumu'
    }
});

module.exports = Job;