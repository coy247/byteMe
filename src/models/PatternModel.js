class PatternModel {
  analyzePatterns(binary) {
    if (!binary || typeof binary !== "string") {
      throw new Error("Invalid binary input");
    }
    return {
      hierarchical: this.findHierarchicalPatterns(binary),
      occurrences: this.findPatternOccurrences(binary),
    };
  }
  findHierarchicalPatterns(binary) {
    const sizes = [2, 4, 8, 16];
    return sizes.map((size) => this.analyzePatternSize(binary, size));
  }
  analyzePatternSize(binary, size) {
    const patterns = {};
    for (let i = 0; i <= binary.length - size; i++) {
      const pattern = binary.substr(i, size);
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
    const mostCommon = Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return {
      size,
      patterns,
      uniquePatterns: Object.keys(patterns).length,
      mostCommon,
    };
  }
  findPatternOccurrences(binary) {
    const occurrences = {};
    const maxSize = Math.min(16, binary.length);
    for (let size = 2; size <= maxSize; size++) {
      for (let i = 0; i <= binary.length - size; i++) {
        const pattern = binary.substr(i, size);
        occurrences[pattern] = (occurrences[pattern] || 0) + 1;
      }
    }
    return occurrences;
  }
}
module.exports = PatternModel;
