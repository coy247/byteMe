const ApplicationBootstrap = require('./services/ApplicationBootstrap');
const Config = require('./utils/Config');
const InjectionContainer = require('./utils/InjectionContainer');

class InjectionContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, constructor, dependencies = []) {
    this.services.set(name, { constructor, dependencies });
    return this;
  }

  registerSingleton(name, instance) {
    this.singletons.set(name, instance);
    return this;
  }

  resolve(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered`);
    }

    const dependencies = service.dependencies.map(dep => this.resolve(dep));
    return new service.constructor(...dependencies);
  }
}

async function main() {
  try {
    const config = new Config();
    await config.load();

    const bootstrap = new ApplicationBootstrap(config);
    const { 
      confidenceModel, 
      confidenceView, 
      dialogueService 
    } = await bootstrap.initialize();

    confidenceView.setupEventListeners(confidenceModel);

    if (process.argv.includes('--test')) {
      await bootstrap.runTests();
    } else if (process.argv[2]) {
      const result = await confidenceModel.improveConfidenceLevel(process.argv[2]);
      console.log('Analysis complete:', result);
    } else {
      console.log(dialogueService.getRandomMessage('startup'));
    }
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

main();