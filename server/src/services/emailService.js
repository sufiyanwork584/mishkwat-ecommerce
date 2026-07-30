import transporter from '../config/email.js';

/**
 * Send email using nodemailer
 * Uses SMTP_FROM as the sender address (required by Brevo/Sendinblue)
 * Falls back to SMTP_USER if SMTP_FROM is not set
 */
export const sendEmail = async ({ to, subject, html }) => {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  
  try {
    const mailOptions = {
      from: `"Mishkwat" <${fromAddress}>`,
      to,
      subject,
      html,
    };
    
    console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId} | Response: ${info.response}`);
    return info;
  } catch (error) {
    console.error('❌ Email send FAILED:', error.message);
    console.error('   Full error:', JSON.stringify({
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    }, null, 2));
    // Re-throw so callers like forgotPassword know it failed
    throw error;
  }
};
