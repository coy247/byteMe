class ModelRegistry {
  constructor(container) {
    this.models = new Map();
    this.instances = new Map();
    this.container = container;
  }
  register() {
    this.registerModel("binary", require("../models/BinaryModel"));
    this.registerModel("metrics", require("../models/MetricsModel"));
    this.registerModel("pattern", require("../models/PatternModel"));
    this.registerModel(
      "predictive",
      require("../models/PredictiveAnalyticsModel")
    );
    this.registerModel("task", require("../models/TaskAutomationModel"));
    this.registerModel("confidence", require("../models/ConfidenceModel"));
    return this;
  }
  registerModel(name, ModelClass) {
    if (this.models.has(name)) {
      throw new Error(`Model ${name} already registered`);
    }
    this.models.set(name, ModelClass);
    return this;
  }
  getInstance(name) {
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }
    const ModelClass = this.models.get(name);
    if (!ModelClass) {
      throw new Error(`Model ${name} not found in registry`);
    }
    const dependencies = this.resolveDependencies(ModelClass);
    const instance = new ModelClass(...dependencies);
    this.instances.set(name, instance);
    return instance;
  }
  resolveDependencies(ModelClass) {
    if (!ModelClass.dependencies) {
      return [];
    }
    return ModelClass.dependencies.map((dep) => this.container.resolve(dep));
  }
  getAllInstances() {
    const instances = {};
    for (const [name] of this.models) {
      instances[name] = this.getInstance(name);
    }
    return instances;
  }
  clear() {
    this.instances.clear();
  }
}
module.exports = ModelRegistry;
