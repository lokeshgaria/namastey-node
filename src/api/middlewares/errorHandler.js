/**
 * Global error handling middleware
 */

function errorHandler(err, req, res, next) {
  // log the errror with full contexxt

  console.error("Error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    userId: req.user?._id,
  });

  // Default error
  let statusCode = err.statusCode || 400;
  let message = err.message || "Internal server error";
  let errorType = err.name || "Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    errorType = "ValidationError";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    errorType = "CastError";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry exists";
    errorType = "DuplicateError";

    console.warn("Duplicate Entry", {
      requestId: req.id,
      errors: err.keyPattern,
    });
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorType = "AuthenticationError";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorType = "AuthenticationError";
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        requestId: req.id,
      }),
    },
  });
}

module.exports = errorHandler;
