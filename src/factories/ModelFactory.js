class ModelFactory {
  constructor(config) {
    this.config = config;
  }
  async createPatternModel() {
    const PatternModel = require("../models/PatternModel");
    return new PatternModel(this.config.pattern);
  }
  async createBinaryModel() {
    const BinaryModel = require("../models/BinaryModel");
    return new BinaryModel(this.config.binary);
  }
  async createMetricsModel() {
    const MetricsModel = require("../models/MetricsModel");
    return new MetricsModel(this.config.metrics);
  }
  async createPredictiveAnalyticsModel() {
    const PredictiveAnalyticsModel = require("../models/PredictiveAnalyticsModel");
    return new PredictiveAnalyticsModel(this.config.predictiveAnalytics);
  }
  async createTaskAutomationModel() {
    const TaskAutomationModel = require("../models/TaskAutomationModel");
    return new TaskAutomationModel(this.config.taskAutomation);
  }
  async createConfidenceModel() {
    const ConfidenceModel = require("../models/ConfidenceModel");
    return new ConfidenceModel(this.config.confidence);
  }
}
module.exports = ModelFactory;
