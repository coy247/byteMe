class ResultProcessor {
  processResult(cleanBinary, stats, visualData, patternSimilarity, complexity, adjustment) {
    if (cleanBinary.match(/^1+$/)) {
      return this.createResult("infinite", {
        stats,
        visualData,
        patternSimilarity,
        complexity,
        adjustment
      });
    }
    // ...rest of result processing logic
  }

  createResult(type, data) {
    return {
      type,
      timestamp: Date.now(),
      data
    };
  }
}

module.exports = ResultProcessor;