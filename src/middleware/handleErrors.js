class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const handleErrors = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }
  return res.status(500).json({
    message: "An unexpected error occurred",
  });
};

module.exports = {
  handleErrors,
  ApiError,
};
