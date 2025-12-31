const nodemailer = require("nodemailer");

/**
 * SMTP ayarları yapıldı mı kontrol eder
 */
function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Nodemailer transporter oluşturur
 */
function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP ortam değişkenleri eksik");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,          // SMTP sunucu adresi
    port: Number(process.env.SMTP_PORT || 587), // SMTP portu
    secure: false,                        // TLS (Gmail için false)
    auth: {
      user: process.env.SMTP_USER,        // Gönderen email
      pass: process.env.SMTP_PASS,        // Email uygulama şifresi
    },
  });
}

/**
 * Doğrulama kodu emaili gönderir
 */
async function sendVerificationEmail(to, code) {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: `"ISBUL ONLINE" <${process.env.SMTP_USER}>`, // Gmail ile aynı olmalı
    to: to,                                           // Alıcı email
    subject: "Email Doğrulama Kodu",
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Email Doğrulama</h2>
        <p>Doğrulama kodunuz:</p>
        <h1 style="letter-spacing:3px">${code}</h1>
        <p>Bu isteği siz yapmadıysanız, bu maili dikkate almayın.</p>
      </div>
    `,
  });

  return info;
}

module.exports = {
  sendVerificationEmail,
  isEmailConfigured,
};
