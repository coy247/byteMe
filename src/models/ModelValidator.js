class ModelValidator {
  static validateModel(model) {
    return (
      this.validateStructure(model) &&
      this.validateMetrics(model) &&
      this.validatePatterns(model)
    );
  }

  static validateStructure(model) {
    const required = ["version", "lastUpdated", "analyses", "metadata"];
    return (
      model &&
      typeof model === "object" &&
      required.every((field) => field in model) &&
      Array.isArray(model.analyses)
    );
  }

  static validateMetrics(model) {
    const required = ["entropy", "complexity", "burstiness"];
    return model.analyses.every(
      (analysis) =>
        analysis.metrics &&
        required.every(
          (metric) =>
            typeof analysis.metrics[metric] === "number" &&
            !isNaN(analysis.metrics[metric])
        )
    );
  }

  static validatePatterns(model) {
    const validTypes = ["alternating", "periodic", "random", "mixed"];
    return model.analyses.every(
      (analysis) =>
        analysis.pattern &&
        validTypes.includes(analysis.pattern.type) &&
        typeof analysis.pattern.confidence === "number"
    );
  }
}

module.exports = ModelValidator;
