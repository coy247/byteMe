const MainController = require('./controllers/MainController');
const AnalysisController = require('./controllers/AnalysisController');
const VisualizationView = require('./views/VisualizationView');
const ResultsView = require('./views/ResultsView');
const PatternAnalyzer = require('./models/PatternAnalyzer');
const MetricsCalculator = require('./models/MetricsCalculator');

class App {
    constructor() {
        this.patternAnalyzer = new PatternAnalyzer();
        this.metricsCalculator = new MetricsCalculator();
        this.visualizationView = new VisualizationView();
        this.resultsView = new ResultsView();
        this.mainController = new MainController(this.visualizationView, this.resultsView);
        this.analysisController = new AnalysisController(this.patternAnalyzer, this.metricsCalculator, this.resultsView);
    }

    init() {
        // Initialize the application flow
        this.mainController.setupEventListeners();
    }
}

const app = new App();
app.init();