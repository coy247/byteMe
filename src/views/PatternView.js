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
}
module.exports = PatternView;
