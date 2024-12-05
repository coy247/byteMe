class AnalysisController {
    constructor(patternAnalyzer, metricsCalculator, visualizationView, resultsView) {
        this.patternAnalyzer = patternAnalyzer;
        this.metricsCalculator = metricsCalculator;
        this.visualizationView = visualizationView;
        this.resultsView = resultsView;
    }

    analyzeData(data) {
        const patterns = this.patternAnalyzer.analyze(data);
        const metrics = this.metricsCalculator.calculateMetrics(patterns);
        
        this.updateViews(patterns, metrics);
    }

    updateViews(patterns, metrics) {
        this.visualizationView.render(patterns);
        this.resultsView.display(metrics);
    }
}

module.exports = AnalysisController;