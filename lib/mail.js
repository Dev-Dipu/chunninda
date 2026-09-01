import nodemailer from 'nodemailer';

export function getWelcomeEmailHtml(email) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CHUNNIINDIA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1a1614; font-family: 'Georgia', 'Times New Roman', serif; color: #f4ece1;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1614; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #b3653b; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(244, 236, 225, 0.2);">
          
          <!-- Brand Logo Header -->
          <tr>
            <td align="center" style="padding: 45px 30px 20px 30px; text-align: center;">
              <!-- Stylized Lotus / Hands Graphic -->
              <div style="font-size: 32px; line-height: 1; margin-bottom: 12px; color: #ffffff;">🪷</div>
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 4px; font-weight: 400; color: #ffffff; text-transform: uppercase;">
                CHUNNIINDIA
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; letter-spacing: 2px; color: rgba(255, 255, 255, 0.85); font-family: sans-serif;">
                चुन्नींडिया
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <div style="height: 1px; width: 60px; background: rgba(255,255,255,0.4); margin: 10px 0 20px 0;"></div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding: 0 35px 15px 35px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; letter-spacing: 3px; font-weight: 300; color: #ffffff; text-transform: uppercase;">
                LAUNCHING SOON
              </h2>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14.5px; line-height: 1.8; font-weight: 300;">
              <p style="margin: 0 0 16px 0;">
                Namaste, and welcome to our inner circle.
              </p>
              <p style="margin: 0 0 20px 0; color: rgba(255, 255, 255, 0.92);">
                Thank you for reserving your spot for <strong>CHUNNIINDIA</strong>'s grand debut. We are meticulously weaving a bespoke collection that celebrates the timeless heritage, intricate zari embroidery, and regal grace of Indian drape artistry.
              </p>
              <p style="margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.92);">
                As a priority patron (<em>${email}</em>), you will receive exclusive private preview access, debut collection lookbooks, and opening invitations before our public release.
              </p>

              <!-- Button CTA -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 25px auto 10px auto;">
                <tr>
                  <td align="center" style="background-color: #f5eee6; border-radius: 2px;">
                    <a href="https://instagram.com/chunniindia" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: sans-serif; font-size: 12px; letter-spacing: 2.5px; font-weight: 600; text-transform: uppercase; color: #1a1614; text-decoration: none;">
                      FOLLOW @CHUNNIINDIA
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td style="background-color: rgba(0, 0, 0, 0.15); padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255, 255, 255, 0.7); font-family: sans-serif;">
                STAY TUNED • CRAFTED WITH REVERENCE
              </p>
            </td>
          </tr>

        </table>

        <!-- Outer Footer -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; margin-top: 24px; text-align: center;">
          <tr>
            <td style="font-family: sans-serif; font-size: 11px; color: #887d75; line-height: 1.6;">
              <p style="margin: 0;">© ${new Date().getFullYear()} CHUNNIINDIA. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">You received this because you subscribed on chunniindia.com</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendWelcomeEmail(toEmail) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'CHUNNIINDIA <hello@chunniindia.com>';

  const html = getWelcomeEmailHtml(toEmail);

  // If SMTP credentials are provided, send via Nodemailer
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: '✨ Welcome to CHUNNIINDIA — You are on the Exclusive Debut List',
        text: `Welcome to CHUNNIINDIA! Thank you for joining our exclusive launch list (${toEmail}). We will keep you posted on our debut collection. Follow us on Instagram @chunniindia`,
        html,
      });

      console.log(`[SMTP] Welcome email successfully sent to ${toEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err) {
      console.error(`[SMTP Error] Failed to send email to ${toEmail}:`, err.message);
      return { success: false, error: err.message, simulated: false };
    }
  }

  // Graceful simulated mode when SMTP env variables are not set yet
  console.log(`[Email Simulation] Welcome email simulated for ${toEmail}. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local for real sending.`);
  return {
    success: true,
    simulated: true,
    note: 'Email simulated. Configure SMTP in .env.local to enable live delivery.'
  };
}
