const InjectionContainer = require('../utils/InjectionContainer');

class ApplicationBootstrap {
  constructor(config) {
    this.config = config;
    this.container = new InjectionContainer();
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

  async runTests() {
    const testService = this.container.resolve('testExecutionService');
    await testService.runTestCaseAnalysis();
  }
}

module.exports = ApplicationBootstrap;