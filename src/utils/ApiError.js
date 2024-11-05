class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // overwrite the fields using our custom values :: parent class ka constructor call hua hai usme apna message bhej rahe to overwrite
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false; // error mein humesha false hi rahega 😁
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
