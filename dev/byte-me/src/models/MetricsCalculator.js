class MetricsCalculator {
    static calculateEntropy(data) {
        const frequency = {};
        const length = data.length;

        data.forEach(value => {
            frequency[value] = (frequency[value] || 0) + 1;
        });

        return Object.values(frequency).reduce((entropy, count) => {
            const probability = count / length;
            return entropy - probability * Math.log2(probability);
        }, 0);
    }

    static calculateCorrelation(dataX, dataY) {
        const n = dataX.length;
        const sumX = dataX.reduce((a, b) => a + b, 0);
        const sumY = dataY.reduce((a, b) => a + b, 0);
        const sumXY = dataX.reduce((sum, x, i) => sum + x * dataY[i], 0);
        const sumX2 = dataX.reduce((sum, x) => sum + x * x, 0);
        const sumY2 = dataY.reduce((sum, y) => sum + y * y, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }
}

module.exports = MetricsCalculator;