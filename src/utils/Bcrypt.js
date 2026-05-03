const bcrypt = require("bcryptjs");
const logger = require("./index").logger;
exports.hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    logger.error("An error occurred while hashing the password", { error });
    throw error;
  }
};

exports.comparePassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    logger.error("An error occurred while comparing the password", { error });
    throw error;
  }
};
