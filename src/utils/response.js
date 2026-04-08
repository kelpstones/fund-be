const responseHelper = {
  success: (
    res,
    message = "Operation successful",
    data = null,
    statusCode = 200,
  ) => {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  },

  withPagination: (
    res,
    message = "Data retrieved",
    data = [],
    pagination = {},
    statusCode = 200,
  ) => {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
      pagination: {
        total_items: parseInt(pagination.totalItems),
        total_pages: Math.ceil(pagination.totalItems / pagination.limit),
        current_page: parseInt(pagination.page),
        limit: parseInt(pagination.limit),
        search: pagination.search || null
      },
    });
  },

  // Response Gagal / Client Error (400, 404, dll)
  error: (res, message = "Something went wrong", statusCode = 400) => {
    return res.status(statusCode).json({
      status: "error",
      message,
    });
  },

  // Response Unauthorized (401)
  unauthorized: (res, message = "Unauthorized access") => {
    return res.status(401).json({
      status: "fail",
      message,
    });
  },

  // Response Forbidden (403)
  forbidden: (res, message = "Access forbidden") => {
    return res.status(403).json({
      status: "fail",
      message,
    });
  },

  // Response Server Error (500)
  serverError: (res, error) => {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      // Jangan tampilkan detail error di production demi keamanan
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  },
};

module.exports = responseHelper;
