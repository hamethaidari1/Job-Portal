module.exports = (sequelize, DataTypes) => {
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
            allowNull: false // <--- الان پسورد اجباری شد چون لوکال کار می‌کنیم
        },
        role: {
            type: DataTypes.ENUM('seeker', 'employer', 'admin'),
            defaultValue: 'seeker'
        }
        // ما فیلد firebaseUid را کاملاً حذف کردیم چون دیگر لازم نیست
    });

    return User;
};