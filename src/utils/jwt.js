const jwt = require("jsonwebtoken");
const db = require("../config/db");
const logger = require("./logger");
exports.generateToken = async (user) => {
  try {
    let bisnis_id = null;
    if (user.role?.nama_role === "umkm") {
      const bisnis = await db("bisnis")
        .where({ user_id: user.id })
        .select("id")
        .first();
      bisnis_id = bisnis?.id ?? null;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role_name: user.role.nama_role,
      bisnis_id: bisnis_id,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  } catch (error) {
    logger.error("Error generating token:", { error });
    throw error;
  }
};

exports.refreshToken = async (data) => {
  try {
    let bisnis_id = null;
    if (data.role?.nama_role === "umkm") {
      const bisnis = await db("bisnis")
        .where({ user_id: data.id })
        .select("id")
        .first();
      bisnis_id = bisnis?.id ?? null;
    }
    const newToken = jwt.sign(
      {
        id: data.id,
        email: data.email,
        role_name: data.role.nama_role,
        bisnis_id: bisnis_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );
    // logger.info("Token refreshed successfully", { token: newToken });
    return newToken;
  } catch (error) {
    logger.error("Error refreshing token:", { error });
    throw error;
  }
};

exports.decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error("Error decoding token:", { error });
    return null;
  }
};

// admin
exports.generateAdminToken = (admin) => {
  try {
    const payload = {
      id: admin.id,
      email: admin.email,
      level: admin.level, // Assuming 'level' represents the admin's role
    };
    return jwt.sign(payload, process.env.JWT_SECRET_ADMIN, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  } catch (error) {
    logger.error("Error generating admin token:", { error });
    throw error;
  }
};

exports.refreshAdminToken = async (data) => {
  try {
    const newToken = jwt.sign(
      {
        id: data.id,
        email: data.email,
        level: data.level,
      },
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );
    return newToken;
  } catch (error) {
    logger.error("Error refreshing admin token:", { error });
    throw error;
  }
};
