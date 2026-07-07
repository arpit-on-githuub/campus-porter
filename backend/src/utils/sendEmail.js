const nodemailer = require('nodemailer');

// Fail fast instead of hanging forever when a host blocks/drops SMTP.
const TIMEOUTS = {
  connectionTimeout: 10000, // 10s to establish the TCP connection
  greetingTimeout: 10000,   // 10s to receive the SMTP greeting
  socketTimeout: 15000      // 15s of socket inactivity
};

// Turn EMAIL_FROM ("SLING <no-reply@x>" or "no-reply@x") into { name, email }.
const parseSender = () => {
  const raw = process.env.EMAIL_FROM || process.env.EMAIL_USER || '';
  const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: (match[1] || 'SLING').trim(), email: match[2].trim() };
  }
  return { name: 'SLING', email: raw.trim() };
};

// Preferred path in production. Many hosts (Render free, etc.) block outbound
// SMTP ports, so we send over Brevo's HTTPS API (port 443), which is never
// blocked. Enabled by setting BREVO_API_KEY.
const sendViaBrevoApi = async (to, subject, html) => {
  const sender = parseSender();
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo API responded ${res.status}: ${detail}`);
  }
};

// SMTP transport, used locally or on hosts that allow outbound SMTP.
const buildTransport = () => {
  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  };

  // Prefer an explicit provider when EMAIL_HOST is set. Falls back to Gmail
  // for local development.
  if (process.env.EMAIL_HOST) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // true for 465, false for 587/others (STARTTLS)
      auth,
      ...TIMEOUTS
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth,
    ...TIMEOUTS
  });
};

const sendViaSmtp = async (to, subject, html) => {
  const transporter = buildTransport();
  const sender = parseSender();
  await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    subject,
    html
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.BREVO_API_KEY) {
      await sendViaBrevoApi(to, subject, html);
    } else {
      await sendViaSmtp(to, subject, html);
    }
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;