const { createClient } = require("redis");
const logger = require("../utils/index").logger;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", { error: err });
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("Failed to connect to Redis", { error: err });
  }
})();

module.exports = redisClient;