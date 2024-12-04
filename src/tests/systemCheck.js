const path = require('path');
const fs = require('fs');
const { PatternAnalyzer } = require('../models/PatternAnalyzer');
const { ScoreManager } = require('../services/ScoreManager');
const { BinaryNetwork } = require('../models/BinaryNetwork');

async function checkSystem() {
    // Structure check
    const dirs = [
        'src/models',
        'src/services',
        'src/utils',
        'src/tests',
        'data',
        'config'
    ];
    
    console.log('\n1. Project Structure Check:');
    dirs.forEach(dir => {
        const exists = fs.existsSync(path.join(process.cwd(), dir));
        console.log(`${dir}: ${exists ? '✓' : '✗'}`);
    });

    // Component check
    console.log('\n2. Component Integration Test:');
    try {
        const analyzer = new PatternAnalyzer();
        const scoreManager = new ScoreManager();
        const network = new BinaryNetwork();

        // Test pattern analysis
        const testPattern = "1010101010";
        const analysis = await analyzer.analyze(testPattern);
        console.log('Pattern Analysis:', analysis ? '✓' : '✗');

        // Test scoring
        const score = scoreManager.processPattern(analysis);
        console.log('Score Processing:', score ? '✓' : '✗');

        // Test neural network
        await network.initialize();
        const prediction = await network.predict(testPattern);
        console.log('Neural Network:', prediction ? '✓' : '✗');

        return true;
    } catch (error) {
        console.error('Test failed:', error);
        return false;
    }
}

if (require.main === module) {
    checkSystem()
        .then(success => {
            console.log('\nSystem Check:', success ? 'PASSED' : 'FAILED');
            process.exit(success ? 0 : 1);
        });
}

module.exports = { checkSystem };