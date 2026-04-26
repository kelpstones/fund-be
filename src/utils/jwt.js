const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_name: user.role.nama_role,
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
        role_name: data.role.nama_role,
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
    console.error("Error generating admin token:", error);
    throw error;
  }
};

exports.refreshAdminToken = (data) => {
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
    console.error("Error refreshing admin token:", error);
    throw error;
  }
};
