class AppRunner {
  constructor(app, commandParser) {
    this.app = app;
    this.commandParser = commandParser;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async run() {
    if (this.commandParser.isTestMode()) {
      await this.app.testRunner.runTests();
    } else if (this.commandParser.getBinaryInput()) {
      await this.app.confidenceModel.improveConfidenceLevel(
        this.commandParser.getBinaryInput()
      );
    } else {
      await this.start();
    }
  }

  async start() {
    await this.app.applicationController.start();
  }

  async shutdown() {
    await this.app.applicationController.shutdown();
    process.exit(0);
  }
}

module.exports = AppRunner;