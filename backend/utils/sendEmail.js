const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({
  email,
  subject,
  body,
}) => {
  const info = await transport.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: body,
  });

  return info;
};

module.exports = {
  sendEmail,
};
