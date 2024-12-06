const { handleUserInput } = require('./InputController');
const { handleTestData } = require('./TestDataController');
const { Logger } = require('../utils/Logger');
const { Config } = require("../utils/Config");

class ApplicationController {
  constructor(options = {}) {
    this.logger = options.logger || new Logger();
    this.performanceWizard = options.performanceWizard;
    this.mainController = options.mainController;
    this.config = new Config();
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

  async start(args = process.argv.slice(2)) {
    try {
      this.logger.info('Starting application...');
      this.performanceWizard.start();

      const { command, options } = this.parseArguments(args);
      await this.executeCommand(command, options);

      this.logger.info('Application completed successfully');
    } catch (error) {
      this.logger.error('Application error:', error);
      process.exit(1);
    }
  }

  parseArguments(args) {
    const command = args[0];
    const options = args.slice(1);
    return { command, options };
  }

  async executeCommand(command, options) {
    switch (command) {
      case '--test':
        await handleTestData();
        break;
      case undefined:
        throw new Error('No binary input provided');
      default:
        await handleUserInput(command);
    }
  }

  shutdown() {
    this.logger.info('Shutting down...');
    this.performanceWizard.reportPerformance();
    process.exit(0);
  }
}

module.exports = ApplicationController;
