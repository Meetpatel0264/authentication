const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendEmail = async ({
  email,
  subject,
  body,
}) => {
  console.log("SMTP sending started...");

  const info = await transport.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: body,
  });

  console.log("SMTP response:", info.response);

  return info;
};

module.exports = {
  transport,
  sendEmail,
};
