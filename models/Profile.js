const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User first name'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User last name'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Telefon numarası'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Address info'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Yaşadığın yer (Şehir/İlçe)'
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Birth date'
    },
    skills: {
        type: DataTypes.TEXT, // JSON string olarak tutabiliriz veya virgülle ayrılmış
        allowNull: true,
        comment: 'Skills'
    },
    experience: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Experience'
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Profil Fotoğrafı Yolu'
    },
    cvPath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'CV Dosya Yolu'
    }
});

module.exports = Profile;