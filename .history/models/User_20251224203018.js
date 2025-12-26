const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // فایل اتصال به دیتابیس

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('jobseeker', 'employer'), // نقش کاربر
        defaultValue: 'jobseeker'
    }
});

module.exports = User;