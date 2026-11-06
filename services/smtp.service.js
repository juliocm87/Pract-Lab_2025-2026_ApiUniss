const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Ignorar errores de certificado SSL
    rejectUnauthorized: false,
    // Configuración adicional para certificados autofirmados
    ciphers: 'SSLv3',
    checkServerIdentity: () => undefined
  },
  // Configuración adicional para evitar problemas de certificado
  ignoreTLS: false,
  requireTLS: false
});

async function enviarCorreo({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    };
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error; // Lanzar el error para que el controlador lo maneje
  }
}

module.exports = { enviarCorreo }; 