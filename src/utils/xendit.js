const { Xendit } = require("xendit-node");
const logger = require("./logger");

if (!process.env.XENDIT_SECRET_KEY) {
  logger.warn("XENDIT_SECRET_KEY is not defined in environment variables!");
}

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "xnd_development_dummy_key",
});

module.exports = xenditClient;
