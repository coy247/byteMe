const InjectionContainer = require('../utils/InjectionContainer');
const ModelRegistry = require('../registry/ModelRegistry');
const ViewRegistry = require('../registry/ViewRegistry');
const ServiceRegistry = require('../registry/ServiceRegistry');
const MainController = require('../controllers/MainController');
const AnalysisController = require('../controllers/AnalysisController');
const VisualizationController = require('../controllers/VisualizationController');

class ApplicationBootstrap {
  constructor(config) {
    this.config = config;
    this.container = new InjectionContainer();
    this.modelRegistry = new ModelRegistry(this.container).register();
    this.viewRegistry = new ViewRegistry(this.container).register();
    this.serviceRegistry = new ServiceRegistry(this.container).register();
  }

  async initialize() {
    this.registerDependencies();
    return {
      confidenceModel: this.container.resolve('confidenceModel'),
      dialogueService: this.container.resolve('dialogueService'),
      testExecutionService: this.container.resolve('testExecutionService'),
      mainController: this.container.resolve('mainController'),
      analysisController: this.container.resolve('analysisController'),
      visualizationController: this.container.resolve('visualizationController')
    };
  }

  registerDependencies() {
    this.container
      .registerSingleton('config', this.config)
      .register('binaryModel', this.modelRegistry.get('binary'))
      .register('metricsModel', this.modelRegistry.get('metrics'))
      .register('patternModel', this.modelRegistry.get('pattern'))
      .register('predictiveModel', this.modelRegistry.get('predictive'))
      .register('taskModel', this.modelRegistry.get('task'))
      .register('confidenceModel', this.modelRegistry.get('confidence'))
      .register('metricsView', this.viewRegistry.get('metrics'))
      .register('patternView', this.viewRegistry.get('pattern'))
      .register('dialogueService', this.serviceRegistry.get('dialogue'))
      .register('performanceService', this.serviceRegistry.get('performance'))
      .register('testExecutionService', this.serviceRegistry.get('testExecution'))
      .register('mainController', MainController, ['binaryModel', 'metricsModel', 'patternModel', 'predictiveModel', 'taskModel', 'confidenceModel', 'metricsView', 'patternView'])
      .register('analysisController', AnalysisController, ['patternModel', 'metricsModel'])
      .register('visualizationController', VisualizationController, ['metricsView', 'patternView']);
  }
}

module.exports = ApplicationBootstrap;