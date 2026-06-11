class MetricsView {
  constructor(data) {
    this.data = data;
  }
  render(metrics) {
    return {
      summary: {
        entropy: metrics.entropy || 0,
        complexity: metrics.complexity || 0,
        correlation: metrics.correlation || 0,
      },
      distributions: {
        runLengths: this.calculateRunLengths(this.data),
        patternDensity: this.calculateDensity(this.data),
        transitions: this.calculateTransitions(this.data),
      },
    };
  }
  calculateRunLengths(binary) {
    if (!binary) return [];
    const matches = binary.match(/([01])\1*/g);
    return matches ? matches.map((run) => run.length) : [];
  }
  calculateDensity(binary) {
    if (!binary) return [0];
    const windowSize = Math.min(100, binary.length);
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i += windowSize) {
      const window = binary.substr(i, windowSize);
      density.push((window.match(/1/g) || []).length / windowSize);
    }
    return density;
  }
  calculateTransitions(binary) {
    if (!binary) return 0;
    const matches = binary.match(/(01|10)/g);
    return matches ? matches.length / binary.length : 0;
  }
}
module.exports = MetricsView;
