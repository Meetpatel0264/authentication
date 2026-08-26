const IORedis = require("ioredis");

const redisConnection = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  }
);

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error) => {
  console.error("Redis error:", error.message);
});

module.exports = redisConnection;