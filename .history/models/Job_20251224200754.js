const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // مطمئن شوید مسیر دیتابیس درست است

const Job = sequelize.define('Job', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        type: DataTypes.STRING, // مثلاً "2000-3000 USD"
        allowNull: true
    },
    jobType: {
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Remote', 'Freelance'),
        defaultValue: 'Full-time'
    }
});

module.exports = Job;