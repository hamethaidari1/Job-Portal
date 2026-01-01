const nodemailer = require('nodemailer');
require('dotenv').config();

const port = Number(process.env.SMTP_PORT || 587);
const secure = process.env.SMTP_SECURE !== undefined
    ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
    : port === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000
});

async function testEmail() {
    try {
        console.log('Testing SMTP Connection...');
        console.log('Host:', process.env.SMTP_HOST);
        console.log('Port:', port);
        console.log('Secure:', secure);
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