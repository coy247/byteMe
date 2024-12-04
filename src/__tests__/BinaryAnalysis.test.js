const { BinaryAnalysis } = require('../index');

describe('BinaryAnalysis', () => {
    test('should analyze alternating pattern', () => {
        const analysis = new BinaryAnalysis('1010101010');
        const result = analysis.analyze();
        expect(result.pattern_type).toBe('alternating');
    });
    
    test('should analyze periodic pattern', () => {
        const analysis = new BinaryAnalysis('11001100');
        const result = analysis.analyze();
        expect(result.pattern_type).toBe('periodic');
    });
});