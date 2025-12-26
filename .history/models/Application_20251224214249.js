const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        defaultValue: 'pending',
        comment: 'Başvuru durumu'
    },
    resumeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'CV dosya yolu'
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ön yazı'
    }
});

module.exports = Application;