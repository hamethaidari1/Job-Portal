

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
    throw new Error(err);
  }
  return await response.json();
}

async function sendVerificationEmail(to, code) {
  const subject = "Email Doğrulama Kodu";
  const html = `
    <div>
      <h2>Email Doğrulama</h2>
      <p>Kodunuz:</p>
      <h1>${code}</h1>
    </div>
  `;
  const text = `Kodunuz: ${code}`;

  if (isResendConfigured()) {
    return sendWithResend(to, subject, html, text);
  }
  if (isEmailConfigured()) {
    const transporter = getTransporter();
    return transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
  }
  throw new Error("Email service not configured");
}

module.exports = {
  sendVerificationEmail,
  isEmailConfigured,
  isResendConfigured,
};
