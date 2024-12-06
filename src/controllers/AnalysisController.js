// filepath: /src/controllers/AnalysisController.js
const VisualizationController = require("./VisualizationController");
const BinaryModel = require("../models/BinaryModel");
const MetricsModel = require("../models/MetricsModel");
const PatternModel = require("../models/PatternModel");
class AnalysisController {
  constructor({ patternModel, metricsModel }) {
    this.patternModel = patternModel;
    this.metricsModel = metricsModel;
  }

  async analyze(binary) {
    const analysisResult = this.patternModel.analyzeComplete(binary);
    console.log('AnalysisController analyze result:', JSON.stringify(analysisResult, null, 2));
    return analysisResult;
  }
}

module.exports = AnalysisController;
