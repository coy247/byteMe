class ViewRegistry {
  constructor() {
    this.views = new Map();
  }

  register() {
    this.views.set("metrics", require("../views/MetricsView"));
    this.views.set("pattern", require("../views/PatternView"));
    return this;
  }

  get(name) {
    return this.views.get(name);
  }
}
