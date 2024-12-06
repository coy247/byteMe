class PatternView {
  render(patterns) {
    return patterns.map((p) => ({
      size: p.size,
      uniqueCount: p.uniquePatterns,
      topPatterns: this.getTopPatterns(p.mostCommon),
    }));
  }
  getTopPatterns(patterns) {
    return patterns
      ? patterns.slice(0, 3).map(([pattern, count]) => ({
          pattern,
          count,
        }))
      : [];
  }
  displayResult(result) {
    console.log(JSON.stringify(result, null, 2));
  }
  generateVisualizationData(binary, windowSizes) {
    return {
      runLengths: (binary.match(/([01])\1*/g) || []).map((run) => run.length),
      patternDensity: this.calculatePatternDensity(binary),
      transitions: this.calculateTransitions(binary),
      slidingWindowAnalysis: this.generateSlidingWindowAnalysis(
        binary,
        windowSizes
      ),
    };
  }
  generateSlidingWindowAnalysis(binary, windowSizes) {
    return windowSizes.map((size) => ({
      windowSize: size,
      density: Array.from(
        { length: Math.floor(binary.length / size) },
        (_, i) => binary.substr(i * size, size).split("1").length - 1 / size
      ),
    }));
  }
}
module.exports = PatternView;
