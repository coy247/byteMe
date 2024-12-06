const BinaryModel = require('../models/BinaryModel');
const MetricsModel = require('../models/MetricsModel');
const PatternModel = require('../models/PatternModel');
const PredictiveAnalyticsModel = require('../models/PredictiveAnalyticsModel');
const TaskAutomationModel = require('../models/TaskAutomationModel');
const ConfidenceModel = require('../models/ConfidenceModel');

class ModelInitializationService {
  constructor(config) {
    this.config = config;
  }

  initialize() {
    return {
      binaryModel: new BinaryModel(),
      metricsModel: new MetricsModel(),
      patternModel: new PatternModel(),
      predictiveAnalyticsModel: new PredictiveAnalyticsModel(),
      taskAutomationModel: new TaskAutomationModel(),
      confidenceModel: new ConfidenceModel()
    };
  }
}

module.exports = ModelInitializationService;