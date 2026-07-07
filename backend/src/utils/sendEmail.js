const nodemailer = require('nodemailer');

// Fail fast instead of hanging forever when a host blocks/drops SMTP.
const TIMEOUTS = {
  connectionTimeout: 10000, // 10s to establish the TCP connection
  greetingTimeout: 10000,   // 10s to receive the SMTP greeting
  socketTimeout: 15000      // 15s of socket inactivity
};

const buildTransport = () => {
  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  };

  // Prefer an explicit provider (e.g. Brevo/SendGrid/Mailgun) when EMAIL_HOST
  // is set, so the provider can be swapped without touching code. Falls back
  // to Gmail for local development.
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

const sendEmail = async (to, subject, html) => {
  const transporter = buildTransport();

  const mailOptions = {
    from: `"SLING" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;