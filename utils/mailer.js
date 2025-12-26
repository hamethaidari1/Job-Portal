const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendVerificationEmail(to, code) {
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Email Verification Code',
        text: `Your verification code is ${code}`,
        html: `<p>Your verification code is <b>${code}</b></p>`
    });
    return info;
}

module.exports = { sendVerificationEmail };

