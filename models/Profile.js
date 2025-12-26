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
        comment: 'Kullanıcının adı'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Kullanıcının soyadı'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Telefon numarası'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Adres bilgisi'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Yaşadığın yer (Şehir/İlçe)'
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Doğum tarihi'
    },
    skills: {
        type: DataTypes.TEXT, // JSON string olarak tutabiliriz veya virgülle ayrılmış
        allowNull: true,
        comment: 'Yetenekler (Skills)'
    },
    experience: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'İş Deneyimi (Experience)'
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