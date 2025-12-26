module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
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
        employerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return Job;
};