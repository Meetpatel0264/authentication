const nodemailer = require("nodemailer");

const sendOtpEmail = async (user, otp, type = "register") => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let subject = "Email Verification OTP";

  if (type === "login") {
    subject = "Login Verification OTP";
  }

  if (type === "forgot-password") {
    subject = "Forgot Password OTP";
  }

  const mailOptions = {
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject,
    text: `Your OTP is ${otp}. This OTP is valid for 10 minutes.`,
  };

  const info = await transport.sendMail(mailOptions);

  console.log("OTP email sent:", info.messageId);

  return info;
};

module.exports = {
  sendOtpEmail,
};