const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function testEmail() {
    try {
        console.log('Testing SMTP Connection...');
        console.log('User:', process.env.SMTP_USER);
        
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to yourself
            subject: 'Test Email from JobPortal',
            text: 'This is a test email.',
        });

        console.log('✅ Email sent:', info.messageId);

    } catch (error) {
        console.error('❌ Email Error:', error);
    }
}

testEmail();