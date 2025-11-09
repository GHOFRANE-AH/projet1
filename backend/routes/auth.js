const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

let currentCode = null;

router.post('/send-code', async (req, res) => {
  currentCode = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: MAIL_USER,
    to: ADMIN_EMAIL,
    subject: 'Code de vérification admin',
    text: `Voici votre code : ${currentCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email :', error);
    res.status(500).json({ error: 'Erreur lors de l’envoi du code' });
  }
});

router.post('/verify-code', (req, res) => {
  const { code } = req.body;
  if (code === currentCode) {
    currentCode = null;
    return res.json({ success: true });
  }
  res.status(403).json({ error: 'Code incorrect' });
});

module.exports = router;
