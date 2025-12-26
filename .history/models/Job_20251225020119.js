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
    // فیلد جدید برای ذخیره آدرس لوگوی شرکت
    companyLogo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobType: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        // تغییر به INTEGER برای محاسبات بهتر مالی در آینده
        type: DataTypes.INTEGER, 
        allowNull: true,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Job;