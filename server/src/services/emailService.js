import transporter from '../config/email.js';

/**
 * Send email using nodemailer
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Mishkwat" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw - email failures shouldn't break the flow
  }
};
