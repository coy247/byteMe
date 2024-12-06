const MainController = require('../controllers/MainController');
const AnalysisController = require('../controllers/AnalysisController');
const VisualizationController = require('../controllers/VisualizationController');

class ControllerFactory {
  constructor(config) {
    this.config = config;
  }

  async createMainController(models, views) {
    return new MainController({
      binaryModel: models.binary,
      metricsModel: models.metrics,
      patternModel: models.pattern,
      predictiveAnalyticsModel: models.predictiveAnalytics,
      taskAutomationModel: models.taskAutomation,
      confidenceModel: models.confidence,
      metricsView: views.metrics,
      patternView: views.pattern
    });
  }

  async createAnalysisController(models) {
    return new AnalysisController({
      patternModel: models.pattern,
      metricsModel: models.metrics
    });
  }

  async createVisualizationController(views) {
    return new VisualizationController({
      metricsView: views.metrics,
      patternView: views.pattern
    });
  }
}

module.exports = ControllerFactory;