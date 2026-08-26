const { Queue } = require("bullmq");
const connection = require("../config/redis");

const emailQueue = new Queue("email-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 500,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
      count: 1000,
    },
  },
});

const addEmailToQueue = async ({ email, subject, body, purpose }) => {
  const job = await emailQueue.add(
    "send-email",
    {
      email,
      subject,
      body,
      purpose,
    },
    {
      priority: purpose === "register" || purpose === "login" ? 1 : 5,
    }
  );

  console.log(`Email job queued: ${job.id} -> ${email}`);
  return job;
};

module.exports = {
  emailQueue,
  addEmailToQueue,
};