const InjectionContainer = require('../utils/InjectionContainer');
const ModelRegistry = require('../registry/ModelRegistry');
const ViewRegistry = require('../registry/ViewRegistry');
const ServiceRegistry = require('../registry/ServiceRegistry');

class ApplicationBootstrap {
  constructor(config) {
    this.config = config;
    this.container = new InjectionContainer();
    this.modelRegistry = new ModelRegistry().register();
    this.viewRegistry = new ViewRegistry().register();
    this.serviceRegistry = new ServiceRegistry().register();
  }

  async initialize() {
    this.registerDependencies();
    return {
      confidenceModel: this.container.resolve('confidenceModel'),
      dialogueService: this.container.resolve('dialogueService'),
      testExecutionService: this.container.resolve('testExecutionService')
    };
  }

  registerDependencies() {
    // Remove factory pattern, use direct injection
    this.container
      .registerSingleton('config', this.config)
      .register('binaryModel', BinaryModel)
      .register('metricsModel', MetricsModel)
      .register('patternModel', PatternModel)
      .register('dialogueService', DialogueService)
      .register('confidenceModel', ConfidenceModel, ['patternModel'])
      .register('testExecutionService', TestExecutionService, ['confidenceModel']);
  }
}

module.exports = ApplicationBootstrap;