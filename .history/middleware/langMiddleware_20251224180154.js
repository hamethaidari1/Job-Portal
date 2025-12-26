const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const Category = require('./Category');
const Profile = require('./Profile');

// İlişkiler (Associations)
User.hasMany(Job, { foreignKey: 'employerId' });
Job.belongsTo(User, { foreignKey: 'employerId' });

User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

User.hasMany(Application, { foreignKey: 'seekerId' });
Application.belongsTo(User, { foreignKey: 'seekerId' });

Category.hasMany(Job, { foreignKey: 'categoryId' });
Job.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = { sequelize, User, Job, Application, Category, Profile };