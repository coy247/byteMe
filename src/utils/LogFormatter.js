class LogFormatter {
  constructor() {
    this.colors = {
      error: "\x1b[31m",
      warn: "\x1b[33m",
      info: "\x1b[36m",
      debug: "\x1b[90m",
      reset: "\x1b[0m",
    };
  }
  format(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metadataStr = Object.keys(metadata).length
      ? JSON.stringify(metadata)
      : "";
    return (
      "[" +
      timestamp +
      "] " +
      level.toUpperCase() +
      ": " +
      message +
      " " +
      metadataStr
    );
  }
  colorize(level, message) {
    return this.colors[level] + message + this.colors.reset;
  }
}
module.exports = { LogFormatter };
