// filepath: /src/controllers/AnalysisController.js
const VisualizationController = require("./VisualizationController");
const BinaryModel = require("../models/BinaryModel");
const MetricsModel = require("../models/MetricsModel");
const PatternModel = require("../models/PatternModel");
class AnalysisController {
  constructor() {
    this.binaryModel = null;
    this.metricsModel = new MetricsModel();
    this.patternModel = new PatternModel();
    this.visualizationController = new VisualizationController();
  }
  analyze(binary) {
    this.binaryModel = new BinaryModel(binary);
    const analysisResult = this.binaryModel.analyze();
    return this.processResults(analysisResult);
  }
  processResults(analysisResult) {
    try {
      // Validate result
      if (!analysisResult || !analysisResult.pattern_metrics) {
        throw new Error("Invalid analysis result");
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
