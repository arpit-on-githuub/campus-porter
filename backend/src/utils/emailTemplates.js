// Branded HTML email templates for SLING.
// Email clients are picky, so these use table-based layout with inline styles
// (no flexbox, no external CSS) for the widest compatibility, with a solid
// colour fallback behind every gradient.

const APP_URL = 'https://campus-porter.vercel.app';
const BLUE = '#2563eb';
const CYAN = '#06b6d4';

const layout = (innerHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:92%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,0.08);font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="background-color:${BLUE};background:linear-gradient(135deg,${BLUE} 0%,${CYAN} 100%);padding:34px 24px;text-align:center;">
              <div style="font-size:30px;font-weight:800;letter-spacing:3px;color:#ffffff;">SLING</div>
              <div style="font-size:11px;letter-spacing:3px;color:#e0f2fe;text-transform:uppercase;margin-top:5px;">Move things, easily</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;color:#0f172a;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:12px;color:#94a3b8;">SLING &middot; IIT Jodhpur Delivery Network</div>
              <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">You received this because you have a SLING account.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const otpBox = (otp) => `
  <div style="margin:22px 0;padding:20px;background-color:#eff6ff;border:1px solid #dbeafe;border-radius:14px;text-align:center;">
    <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;">Your code</div>
    <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:${BLUE};margin-top:8px;font-family:'Courier New',monospace;">${otp}</div>
  </div>`;

const verificationEmail = (otp) => ({
  subject: 'Verify your SLING account',
  html: layout(`
    <h1 style="font-size:20px;margin:0 0 8px 0;color:#0f172a;">Welcome to SLING 🎉</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0;">
      You are one step away from moving things across campus without moving yourself.
      Enter the code below to verify your email.
    </p>
    ${otpBox(otp)}
    <p style="font-size:13px;color:#64748b;margin:0 0 4px 0;">This code expires in <b>10 minutes</b>.</p>
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px 0;">Did not sign up? You can safely ignore this email.</p>
  `)
});

const passwordResetEmail = (otp) => ({
  subject: 'Reset your SLING password',
  html: layout(`
    <h1 style="font-size:20px;margin:0 0 8px 0;color:#0f172a;">Password reset 🔑</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0;">
      Enter the code below in the app to set a new password for your SLING account.
    </p>
    ${otpBox(otp)}
    <p style="font-size:13px;color:#64748b;margin:0 0 4px 0;">This code expires in <b>10 minutes</b>.</p>
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px 0;">If you did not request this, ignore this email and your password stays the same.</p>
  `)
});

const newRequestEmail = ({ requesterName, fromLocation, toLocation, itemDescription, rewardLine }) => ({
  subject: '🎯 New SLING request',
  html: layout(`
    <h1 style="font-size:20px;margin:0 0 8px 0;color:#0f172a;">A new request just dropped</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 18px 0;">
      <b>${requesterName}</b> needs a hand. If you are already headed that way, grab it and earn the reward.
    </p>
    <div style="padding:16px 18px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
      <div style="font-size:14px;color:#0f172a;margin-bottom:12px;">
        <span style="background-color:#eff6ff;color:${BLUE};padding:4px 10px;border-radius:8px;font-weight:600;">${fromLocation}</span>
        <span style="color:#94a3b8;">&nbsp;&rarr;&nbsp;</span>
        <span style="background-color:#ecfdf5;color:#059669;padding:4px 10px;border-radius:8px;font-weight:600;">${toLocation}</span>
      </div>
      <div style="font-size:14px;color:#334155;margin-bottom:6px;"><b>Item:</b> ${itemDescription}</div>
      <div style="font-size:14px;color:#334155;">${rewardLine}</div>
    </div>
    <div style="text-align:center;margin:24px 0 8px 0;">
      <a href="${APP_URL}" style="display:inline-block;background-color:${BLUE};background:linear-gradient(135deg,${BLUE} 0%,${CYAN} 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 30px;border-radius:12px;">Open SLING</a>
    </div>
  `)
});

module.exports = { verificationEmail, passwordResetEmail, newRequestEmail };
