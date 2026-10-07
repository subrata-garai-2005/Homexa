import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

let transporter = null;

export const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('⚠️ SMTP not configured - emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
};

export const getMailGenerator = () => {
  return new Mailgen({
    theme: 'default',
    product: {
      name: 'Homexa',
      link: process.env.FRONTEND_URL || 'http://localhost:5173',
      logo: 'https://img.icons8.com/fluency/96/home--v1.png',
      copyright: '© 2026 Homexa. All rights reserved.'
    }
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();
  
  if (!mailTransporter) {
    console.log(`\n📧 [MOCK EMAIL] To: ${to}\nSubject: ${subject}\n${text || html?.substring(0, 500)}\n`);
    return { messageId: `mock_${Date.now()}`, mocked: true };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'Homexa <noreply@homexa.com>',
      to,
      subject,
      html,
      text
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - log and continue
    console.log(`📧 [FALLBACK LOG] Email to ${to}: ${subject}`);
    return { messageId: `fallback_${Date.now()}`, error: error.message };
  }
};

export default { getTransporter, getMailGenerator, sendEmail };
