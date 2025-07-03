const nodemailer = require('nodemailer');

async function sendMail({ from, to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false, 
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `SendEasy <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

module.exports = sendMail;
