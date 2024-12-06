class MainController {
    constructor(analysisController, visualizationView, resultsView) {
        this.analysisController = analysisController;
        this.visualizationView = visualizationView;
        this.resultsView = resultsView;
    }

    handleUserInput(inputData) {
        const analysisResults = this.analysisController.analyzeData(inputData);
        this.updateViews(analysisResults);
    }

    updateViews(analysisResults) {
        this.visualizationView.render(analysisResults.visualization);
        this.resultsView.display(analysisResults.metrics, analysisResults.patterns);
    }
}

module.exports = MainController;