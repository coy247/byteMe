class MainController {
  constructor({
    binaryModel,
    metricsModel,
    patternModel,
    metricsView,
    patternView,
  }) {
    this.binaryModel = binaryModel;
    this.metricsModel = metricsModel;
    this.patternModel = patternModel;
    this.metricsView = metricsView;
    this.patternView = patternView;
  }
  async analyze(binary) {
    const analysisResult = this.patternModel.analyzeComplete(binary);
    console.log(
      "MainController analyze result:",
      JSON.stringify(analysisResult, null, 2)
    );
    return analysisResult;
  }
}
module.exports = MainController;
