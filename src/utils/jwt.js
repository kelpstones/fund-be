const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
};

exports.refreshToken = (token) => {
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const newToken = jwt.sign(
      {
        id: tokenData.id,
        email: tokenData.email,
        role_id: tokenData.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );
    return newToken;
  } catch (error) {
    throw error;
  }
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
