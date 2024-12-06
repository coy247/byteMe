const BinaryModel = require("./models/BinaryModel");
const MetricsModel = require("./models/MetricsModel");
const PatternModel = require("./models/PatternModel");
const PredictiveAnalyticsModel = require("./models/PredictiveAnalyticsModel");
const TaskAutomationModel = require("./models/TaskAutomationModel");
const ConfidenceModel = require("./models/ConfidenceModel");
const MetricsView = require("./views/MetricsView");
const PatternView = require("./views/PatternView");
const patternModel = new PatternModel();
const patternView = new PatternView();
const binaryModel = new BinaryModel();
const metricsModel = new MetricsModel();
const metricsView = new MetricsView();
const predictiveAnalyticsModel = new PredictiveAnalyticsModel();
const taskAutomationModel = new TaskAutomationModel();
const confidenceModel = new ConfidenceModel();
module.exports = {
  patternModel,
  patternView,
  binaryModel,
  metricsModel,
  metricsView,
  predictiveAnalyticsModel,
  taskAutomationModel,
  confidenceModel,
};
