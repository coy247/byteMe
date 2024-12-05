class VisualizationUtils {
    static generateVisualization(binary, result) {
        if (!binary || typeof binary !== 'string') {
            throw new Error('Invalid binary input');
        }

        if (!result || !result.pattern_metrics || !result.pattern_complexity) {
            throw new Error('Invalid analysis result');
        }

        return {
            summary: {
                entropy: result.pattern_metrics.entropy,
                complexity: result.pattern_complexity.level,
                type: result.pattern_complexity.type
            },
            distributions: {
                runLengths: VisualizationUtils.calculateRunLengths(binary),
                patternDensity: VisualizationUtils.calculatePatternDensity(binary),
                transitions: VisualizationUtils.calculateTransitions(binary)
            },
            metrics: {
                burstiness: result.pattern_metrics.burstiness,
                correlation: result.pattern_metrics.correlation
            },
            patterns: result.pattern_metrics.hierarchicalPatterns.map(p => ({
                size: p.size,
                uniqueCount: p.uniquePatterns,
                topPatterns: p.mostCommon?.slice(0, 3) || []
            }))
        };
    }

    static calculateRunLengths(binary) {
        return binary.match(/([01])\1*/g)?.map(run => run.length) || [];
    }

    static calculatePatternDensity(binary) {
        const windowSize = Math.min(100, binary.length);
        const density = [];
        for (let i = 0; i <= binary.length - windowSize; i += windowSize) {
            const window = binary.substr(i, windowSize);
            density.push((window.match(/1/g)?.length || 0) / windowSize);
        }
        return density;
    }

    static calculateTransitions(binary) {
        return (binary.match(/(01|10)/g)?.length || 0) / binary.length;
    }
}

module.exports = VisualizationUtils;
