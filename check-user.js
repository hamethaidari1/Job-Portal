const { User } = require('./models');
const sequelize = require('./config/database');

async function checkUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'hamedhaidari2023@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (user) {
            console.log('✅ User found:', user.toJSON());
        } else {
            console.log('❌ User NOT found with email:', email);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUser();