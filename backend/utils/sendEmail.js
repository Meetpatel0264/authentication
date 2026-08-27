const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({
  email,
  subject,
  body,
}) => {
  console.log("Email API sending started...");
  console.log("Sending to:", email);

  const { data, error } =
    await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Auth App <onboarding@resend.dev>",

      to: email,
      subject,
      text: body,
    });

  if (error) {
    console.error(
      "RESEND EMAIL ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "Email could not be sent"
    );
  }

  console.log(
    "Email sent successfully:",
    data.id
  );

  return {
    messageId: data.id,
  };
};

module.exports = {
  sendEmail,
};
