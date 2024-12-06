class VisualizationUtils {
    static calculateTransitions(binary) {
        return (binary.match(/(01|10)/g)?.length || 0) / binary.length;
    }

    static calculateEntropy(data) {
        const frequency = {};
        const length = data.length;

        for (const char of data) {
            frequency[char] = (frequency[char] || 0) + 1;
        }

        let entropy = 0;
        for (const key in frequency) {
            const probability = frequency[key] / length;
            entropy -= probability * Math.log2(probability);
        }

        return entropy;
    }

    static calculateCorrelation(data1, data2) {
        const n = data1.length;
        const mean1 = data1.reduce((sum, val) => sum + val, 0) / n;
        const mean2 = data2.reduce((sum, val) => sum + val, 0) / n;

        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;

        for (let i = 0; i < n; i++) {
            const diff1 = data1[i] - mean1;
            const diff2 = data2[i] - mean2;
            numerator += diff1 * diff2;
            denominator1 += diff1 ** 2;
            denominator2 += diff2 ** 2;
        }

        return numerator / Math.sqrt(denominator1 * denominator2);
    }
}

module.exports = VisualizationUtils;