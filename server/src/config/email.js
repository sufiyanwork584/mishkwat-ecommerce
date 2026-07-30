import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Brevo uses STARTTLS, don't reject self-signed certs in dev
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  // Force IPv4 resolution to prevent ECONNREFUSED ::1:587 on Windows
  family: 4,
});

// Log the SMTP configuration variables (with password obfuscated)
console.log('📧 SMTP Configuration loaded:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM,
  passExists: !!process.env.SMTP_PASS,
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('✅ Email service ready (SMTP connected)'))
  .catch((err) => console.error('❌ Email service FAILED to connect:', err.message));

export default transporter;
