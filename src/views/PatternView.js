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
}
module.exports = PatternView;
