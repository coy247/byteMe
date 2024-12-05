const MetricsView = require("../views/MetricsView");
const PatternView = require("../views/PatternView");
class VisualizationController {
  constructor({ metricsView, patternView } = {}) {
    this.metricsView = metricsView || new MetricsView();
    this.patternView = patternView || new PatternView();
  }
  displayResults(data) {
    if (!data || !data.metrics || !data.patterns) {
      throw new Error("Invalid visualization data");
    }
    try {
      const visualization = {
        summary: this.metricsView.render(data.metrics),
        distributions: {
          runLengths: data.metrics.runs || [],
          patternDensity: [data.metrics.correlation || 0],
          transitions: data.metrics.alternating || 0,
        },
        metrics: {
          burstiness: data.metrics.burstiness || 0,
          correlation: data.metrics.correlation || 0,
        },
        patterns: this.patternView.render(data.patterns),
      };
      // Output results
      console.log(JSON.stringify(visualization, null, 2));
      return visualization;
    } catch (error) {
      console.error("Visualization failed:", error);
      throw error;
    }
  }
}
module.exports = VisualizationController;
