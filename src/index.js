const fs = require('fs');

// Controllers
const MainController = require('./controllers/MainController');
const AnalysisController = require('./controllers/AnalysisController');
const VisualizationController = require('./controllers/VisualizationController');

// Models
const BinaryModel = require('./models/BinaryModel');
const MetricsModel = require('./models/MetricsModel');
const PatternModel = require('./models/PatternModel');

// Views
const MetricsView = require('./views/MetricsView');
const PatternView = require('./views/PatternView');

class Application {
    constructor() {
        this.mainController = new MainController({
            binaryModel: new BinaryModel(),
            metricsModel: new MetricsModel(),
            patternModel: new PatternModel()
        });

        this.analysisController = new AnalysisController();
        this.visualizationController = new VisualizationController({
            metricsView: new MetricsView(),
            patternView: new PatternView()
        });
    }

    async analyze(binary) {
        try {
            const result = await this.mainController.analyze(binary);
            const analysis = this.analysisController.processResults(result);
            const visualization = this.visualizationController.displayResults(analysis);

            return {
                analysis,
                visualization,
                error_check: true
            };
        } catch (error) {
            console.error('Analysis failed:', error);
            return {
                error: error.message,
                error_check: false
            };
        }
    }
}

const app = new Application();

// Test binaries
const testBinaries = [
    '1010101010',
    '11110000',
    '10011001'
];

// Run analysis
async function runAnalysis() {
    for (const binary of testBinaries) {
        console.log(`\nAnalyzing binary: ${binary}`);
        const result = await app.analyze(binary);
        console.log(JSON.stringify(result, null, 2));
    }
}

// Execute
runAnalysis().catch(console.error);

module.exports = app;
