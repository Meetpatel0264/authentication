const nodemailer = require("nodemailer");
const dns = require("dns");

// Prefer IPv4 instead of IPv6
dns.setDefaultResultOrder("ipv4first");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Force IPv4
  family: 4,

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,

  tls: {
    servername: "smtp.gmail.com",
  },
});

const sendEmail = async ({
  email,
  subject,
  body,
}) => {
  console.log("SMTP sending started...");
  console.log("Sending to:", email);

  const info = await transport.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: body,
  });

  console.log("SMTP response:", info.response);
  console.log("Message ID:", info.messageId);

  return info;
};

module.exports = {
  transport,
  sendEmail,
};
