const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1. create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
    // host: 'sandbox.smtp.mailtrap.io',
    // port: 2525,
    // auth: {
    //   user: '3a7b7742b3d5d6',
    //   pass: '519f88d6bb0590'
    // }
  });
  // 2. Define email options
  const mailOptions = {
    from: 'Aashish<Testing@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3. actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
