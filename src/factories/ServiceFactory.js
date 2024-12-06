class ServiceFactory {
  createModelStorage() {
    return new ModelStorage();
  }

  createPerformanceWizard() {
    return new PerformanceWizard();
  }
}

module.exports = ServiceFactory;