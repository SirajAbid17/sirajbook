const nodemailer = require("nodemailer");
require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

const sendmail = async (to, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "OTP Verification",
      text: message,
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw new Error("Email not sent");
  }
};

module.exports = sendmail;
