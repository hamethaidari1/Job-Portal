const { User } = require('./models');
const sequelize = require('./config/database');
const crypto = require('crypto');

async function createUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'hamedhaidari2023@gmail.com';
        const password = 'password123';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const firebaseUid = 'manual_' + Date.now();

        const user = await User.create({
            email,
            role: 'job_seeker',
            isVerified: false,
            firebaseUid: firebaseUid,
            password: hashedPassword
        });

        console.log('✅ User created successfully:', user.toJSON());

    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        await sequelize.close();
    }
}

createUser();