class MainController {
  constructor({ binaryModel, metricsModel, patternModel, predictiveAnalyticsModel, taskAutomationModel, confidenceModel, metricsView, patternView }) {
    this.binaryModel = binaryModel;
    this.metricsModel = metricsModel;
    this.patternModel = patternModel;
    this.predictiveAnalyticsModel = predictiveAnalyticsModel;
    this.taskAutomationModel = taskAutomationModel;
    this.confidenceModel = confidenceModel;
    this.metricsView = metricsView;
    this.patternView = patternView;
  }

  async analyze(binary) {
    const analysisResult = this.patternModel.analyzeComplete(binary);
    console.log('MainController analyze result:', JSON.stringify(analysisResult, null, 2));
    return analysisResult;
  }

  predictUserBehavior(context) {
    return this.predictiveAnalyticsModel.predictUserBehavior(context);
  }

  selectAutomationType(pattern) {
    return this.taskAutomationModel.selectAutomationType(pattern);
  }

  improveConfidenceLevel(binary, targetConfidence, maxIterations) {
    return this.confidenceModel.improveConfidenceLevel(binary, targetConfidence, maxIterations);
  }
}

module.exports = MainController;
