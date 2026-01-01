

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const nodemailer = require("nodemailer");

function isEmailConfigured() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS
  );
}

function isResendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE !== undefined
    ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
    : port === 465;

  console.log('📧 Config:', {
    host: process.env.SMTP_HOST,
    port,
    secure,
    user: process.env.SMTP_USER ? '***' : 'missing'
  });

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
  });
}

async function sendWithResend(to, subject, html, text) {
  console.log('📧 Sending with Resend to:', to);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    console.error('❌ Resend Error:', err);
    throw new Error(err);
  }
  return await response.json();
}

async function sendVerificationEmail(to, code) {
  console.log('📧 Sending Verification Email to:', to, 'Code:', code);
  const subject = "Email Doğrulama Kodu";
  const html = `
    <div>
      <h2>Email Doğrulama</h2>
      <p>Kodunuz:</p>
      <h1>${code}</h1>
    </div>
  `;
  const text = `Kodunuz: ${code}`;

  try {
    if (isResendConfigured()) {
      return await sendWithResend(to, subject, html, text);
    }
    if (isEmailConfigured()) {
      const transporter = getTransporter();
      await transporter.verify(); // Verify connection first
      console.log('✅ SMTP Connection Verified');
      
      return await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
      });
    }
  } catch (error) {
    console.error('❌ Send Verification Email Error:', error);
    throw error;
  }
  throw new Error("Email service not configured");
}

module.exports = {
  sendVerificationEmail,
  isEmailConfigured,
  isResendConfigured,
};
