class ModelRegistry {
  constructor() {
    this.models = new Map();
  }

  register() {
    this.models.set("binary", require("../models/BinaryModel"));
    this.models.set("metrics", require("../models/MetricsModel"));
    this.models.set("pattern", require("../models/PatternModel"));
    this.models.set(
      "predictive",
      require("../models/PredictiveAnalyticsModel")
    );
    this.models.set("task", require("../models/TaskAutomationModel"));
    this.models.set("confidence", require("../models/ConfidenceModel"));
    return this;
  }

  get(name) {
    return this.models.get(name);
  }
}
