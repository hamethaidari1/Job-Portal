const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name_tr: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Kategori adı (Türkçe)'
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Category name (English)'
    }
}, {
    timestamps: false
});

module.exports = Category;