class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  register() {
    this.services.set("dialogue", require("../services/DialogueService"));
    this.services.set("performance", require("../utils/PerformanceUtils"));
    return this;
  }

  get(name) {
    return this.services.get(name);
  }
}
