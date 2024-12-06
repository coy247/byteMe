const { handleUserInput } = require('./InputController');
const { handleTestData } = require('./TestDataController');
const { Logger } = require('../utils/Logger');
const { Config } = require("../utils/Config");

class ApplicationController {
  constructor({ performanceWizard, logger, mainController, testExecutionService }) {
    this.performanceWizard = performanceWizard;
    this.logger = logger;
    this.mainController = mainController;
    this.testExecutionService = testExecutionService;
    this.config = new Config();
    this.setupSignalHandlers();
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

  setupSignalHandlers() {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
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

  async shutdown() {
    this.logger.info('Shutting down application...');
    await this.performanceWizard.stop();
    process.exit(0);
  }
}

module.exports = ApplicationController;
