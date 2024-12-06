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

  processResults(analysisResult) {
    try {
      // Validate result
      if (!analysisResult || !analysisResult.pattern_metrics) {
        return {
          error: true,
          message: "Invalid analysis result",
          data: null,
        };
      }
      // Format for visualization
      const formattedResult = {
        metrics: {
          entropy: analysisResult.pattern_metrics.entropy,
          correlation: analysisResult.pattern_metrics.correlation,
          burstiness: analysisResult.pattern_metrics.burstCount,
        },
        patterns: analysisResult.pattern_metrics.hierarchicalPatterns,
        complexity: analysisResult.pattern_complexity,
      };
      // Generate visualization
      return this.visualizationController.displayResults(formattedResult);
    } catch (error) {
      console.error("Result processing failed:", error);
      throw error;
    }
  }
}

module.exports = AnalysisController;
