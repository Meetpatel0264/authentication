require("dotenv").config();

const { Worker } = require("bullmq");
const connection = require("../config/redis");
const { sendEmail } = require("../utils/sendEmail");

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing email job ${job.id}`);

    await sendEmail({
      email: job.data.email,
      subject: job.data.subject,
      body: job.data.body,
    });

    return {
      email: job.data.email,
      sentAt: new Date().toISOString(),
    };
  },
  {
    connection,
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5),
  }
);

worker.on("ready", () => {
  console.log("Email worker ready");
});

worker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed: ${error.message}`);
});

const shutdown = async () => {
  console.log("Stopping email worker...");
  await worker.close();
  await connection.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);