const nodemailer = require("nodemailer");

// Sadece local ortamda dotenv kullan
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/**
 * SMTP ayarları var mı kontrol et
 */
function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Nodemailer transporter oluştur
 */
function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP ortam değişkenleri eksik");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,                 // smtp.gmail.com
    port: Number(process.env.SMTP_PORT || 587),  // 587
    secure: false,                               // Gmail için false
    auth: {
      user: process.env.SMTP_USER,               // Gönderen email
      pass: process.env.SMTP_PASS,               // Gmail App Password (boşluksuz)
    },
    tls: {
      rejectUnauthorized: false, // ⭐ Railway için çok önemli
    },
  });
}

/**
 * Doğrulama emaili gönder
 */
async function sendVerificationEmail(to, code) {
  const subject = "Email Doğrulama Kodu";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6">
      <h2>Email Doğrulama</h2>
      <p>Doğrulama kodunuz:</p>
      <h1 style="letter-spacing:4px">${code}</h1>
      <p>Bu işlemi siz yapmadıysanız, bu maili dikkate almayın.</p>
    </div>
  `;

  const text = `Doğrulama kodunuz: ${code}`;

  // Debug (istersen sonra silebilirsin)
  console.log("SMTP Ayarları:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
  });

  const transporter = getTransporter();

  return await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  sendVerificationEmail,
  isEmailConfigured,
};
