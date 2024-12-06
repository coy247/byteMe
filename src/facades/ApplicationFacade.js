class ApplicationFacade {
  constructor() {
    this.errorHandler = ErrorHandler;
    this.configLoader = ConfigLoader;
  }

  async start() {
    try {
      const config = await this.configLoader.load();
      const bootstrap = new ApplicationBootstrap(config);
      const app = await bootstrap.initialize();
      const commandParser = new CommandParser(process.argv);
      const appRunner = new AppRunner(app, commandParser);
      await appRunner.run();
    } catch (error) {
      this.errorHandler.handle(error);
    }
  }
}

module.exports = ApplicationFacade;
