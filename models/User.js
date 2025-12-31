const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firebaseUid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Firebase tarafından sağlanan benzersiz kullanıcı kimliği'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
        comment: 'Kullanıcının e-posta adresi'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true, // Google ile giriş yapan kullanıcılar için null olabilir
        comment: 'Hashed password'
    },
    role: {
        type: DataTypes.ENUM('job_seeker', 'employer', 'admin'),
        defaultValue: 'job_seeker',
        comment: 'Kullanıcı rolü: İş arayan veya İşveren'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'E-posta doğrulaması yapıldı mı?'
    },
    // Verification fields removed from use
}, {
    timestamps: true // createdAt ve updatedAt otomatik oluşturulur
});

module.exports = User;
