function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: err.message || 'Internal Server Error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && !err.statusCode) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
