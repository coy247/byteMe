const { Logger } = require("../utils/Logger");
const { Config } = require("../utils/Config");
class ApplicationController {
  constructor({
    mainController,
    logger = new Logger(),
    config = new Config(),
  }) {
    this.mainController = mainController;
    this.logger = logger;
    this.config = config;
  }
  async initialize() {
    this.logger.info("Initializing application...");
    await this.config.load();
    this.setupErrorHandlers();
  }
  setupErrorHandlers() {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  }
  async start() {
    try {
      await this.initialize();
      const isTestMode = process.argv.includes("--test");
      if (isTestMode) {
        await this.mainController.handleTestData();
      } else {
        const userInput = process.argv[2];
        if (userInput) {
          await this.mainController.handleUserInput(userInput);
        } else {
          throw new Error("No binary input provided.");
        }
      }
    } catch (error) {
      this.logger.error("Application error:", error);
      process.exit(1);
    }
  }
  async shutdown() {
    this.logger.info("Shutting down application...");
    // Cleanup logic here
    process.exit(0);
  }
}
module.exports = ApplicationController;
