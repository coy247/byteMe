const MetricsView = require('../views/MetricsView');
const PatternView = require('../views/PatternView');

class ViewFactory {
  constructor(config) {
    this.config = config;
  }

  async createMetricsView() {
    return new MetricsView({
      displayMode: this.config.get('views.metrics.displayMode') || 'default',
      colorScheme: this.config.get('views.metrics.colorScheme') || 'standard'
    });
  }

  async createPatternView() {
    return new PatternView({
      visualizationMode: this.config.get('views.pattern.visualizationMode') || '2d',
      maxPatterns: this.config.get('views.pattern.maxPatterns') || 100
    });
  }
}

module.exports = ViewFactory;