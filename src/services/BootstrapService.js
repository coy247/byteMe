const PerformanceService = require("./PerformanceService");
const InitializationService = require("./InitializationService");
const Config = require("../utils/Config");
async function bootstrap() {
  const config = new Config();
  await config.load();
  const performanceService = new PerformanceService();
  performanceService.on("shutdown", (report) => {
    console.log("\n🎯 Performance Report");
    console.log("════════════════════════════════════════");
    console.log(`Total Runtime: ${report.totalRuntime}s`);
    console.log(`Tests Completed: ${report.testsCompleted}`);
    console.log(`Average Analysis Time: ${report.averageAnalysisTime}ms`);
    console.log(`Average Confidence: ${report.averageConfidence}%`);
    console.log("════════════════════════════════════════");
  });
  const initService = new InitializationService(config);
  const { models, views, controllers } = await initService.initialize();
  controllers.main.analyze = performanceService.monitorFunction(
    controllers.main.analyze.bind(controllers.main),
    "analyze"
  );
  controllers.main.improveConfidenceLevel = performanceService.monitorFunction(
    controllers.main.improveConfidenceLevel.bind(controllers.main),
    "improveConfidence"
  );
  performanceService.start();
  return {
    models,
    views,
    controllers,
    services: { performance: performanceService },
  };
}
module.exports = bootstrap;
