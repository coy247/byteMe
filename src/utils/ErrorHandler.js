class ErrorHandler {
  static handle(error) {
    console.error("Application failed to start:", error);
    process.exit(1);
  }
}

module.exports = ErrorHandler;