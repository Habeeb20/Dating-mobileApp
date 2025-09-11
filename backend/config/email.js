import nodemailer from 'nodemailer';
import dotenv from "dotenv"


dotenv.config()
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from:`"Lets meet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification code sent to', email);
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw new Error('Failed to send verification code');
  }
};

export { sendVerificationCode };





