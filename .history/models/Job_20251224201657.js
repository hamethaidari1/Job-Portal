const { DataTypes } = require('sequelize');
const sequelize = require('../database');

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
        type: DataTypes.STRING,
        allowNull: true
    },
    jobType: {
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Remote', 'Freelance'),
        defaultValue: 'Full-time'
    }
});

module.exports = Job;