const nodemailer = require("nodemailer");

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
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

async function sendVerificationEmail(to, code) {
  const subject = "Email Doğrulama Kodu";
  const html = `
      <div style="font-family: Arial, sans-serif">
        <h2>Email Doğrulama</h2>
        <p>Doğrulama kodunuz:</p>
        <h1 style="letter-spacing:3px">${code}</h1>
        <p>Bu isteği siz yapmadıysanız, bu maili dikkate almayın.</p>
      </div>
    `;
  const text = `Doğrulama kodunuz: ${code}`;

  if (isResendConfigured()) {
    const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
    return await res.json();
  }

  const transporter = getTransporter();
  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  sendVerificationEmail,
  isEmailConfigured,
  isResendConfigured,
};
