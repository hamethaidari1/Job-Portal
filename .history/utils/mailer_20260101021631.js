// فقط در لوکال
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
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

  // اگر Resend API Key وجود داشت
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY bulunamadı");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: to,
      subject: subject,
      html: html,
      text: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return await response.json();
}

module.exports = {
  sendVerificationEmail,
};
