const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
   
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
      role_id: admin.level, // Assuming 'level' represents the admin's role
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
        role_id: data.role_id,
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
