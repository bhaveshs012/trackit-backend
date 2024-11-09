const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Include the stack trace only in development
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { errorHandler };
