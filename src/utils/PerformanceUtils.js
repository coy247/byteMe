const performanceWizard = {
  startTime: null,
  totalAnalysisTime: 0,
  testsCompleted: 0,
  averageConfidence: 0,
  start() {
    this.startTime = Date.now();
    this.totalAnalysisTime = 0;
    this.testsCompleted = 0;
    this.averageConfidence = 0;
  },
  trackAnalysis(time, confidence) {
    this.totalAnalysisTime += time;
    this.testsCompleted += 1;
    this.averageConfidence =
      (this.averageConfidence * (this.testsCompleted - 1) + confidence) /
      this.testsCompleted;
  },
};

function reportPerformance() {
  const totalTime = (Date.now() - performanceWizard.startTime) / 1000;
  const avgAnalysisTime =
    performanceWizard.totalAnalysisTime /
    Math.max(1, performanceWizard.testsCompleted);
  const avgConfidence = Math.min(
    100,
    performanceWizard.averageConfidence * 100
  );

  console.log("\n🎯 Performance Report");
  console.log("════════════════════════════════════════");
  console.log(`Total Runtime: ${totalTime.toFixed(2)}s`);
  console.log(`Tests Completed: ${performanceWizard.testsCompleted}`);
  console.log(`Average Analysis Time: ${avgAnalysisTime.toFixed(2)}ms`);
  console.log(
    `Average Confidence: ${(performanceWizard.averageConfidence * 100).toFixed(
      1
    )}%`
  );
}

function monitorPerformance(fn) {
  return function (...args) {
    const start = process.hrtime();
    const result = fn.apply(this, args);
    const end = process.hrtime(start);
    const timeInMs = end[0] * 1000 + end[1] / 1000000;
    performanceWizard.totalAnalysisTime += timeInMs;
    performanceWizard.testsCompleted++;
    if (result && result.confidence) {
      performanceWizard.averageConfidence =
        (performanceWizard.averageConfidence *
          (performanceWizard.testsCompleted - 1) +
          result.confidence) /
        performanceWizard.testsCompleted;
    }
    return result;
  };
}

module.exports = {
  performanceWizard,
  reportPerformance,
  monitorPerformance,
};