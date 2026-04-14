const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

exports.refreshToken = (data) => {
  try {
    const newToken = jwt.sign(
      {
        id: data.id,
        email: data.email,
        role_id: data.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );
    return newToken;
  } catch (error) {
    throw error;
  }
};

exports.decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
