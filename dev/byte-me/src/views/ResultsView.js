class ResultsView {
    constructor() {
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'results-container';
    }

    displayResults(metrics, patterns) {
        this.resultsContainer.innerHTML = '';

        const metricsSection = this.createMetricsSection(metrics);
        const patternsSection = this.createPatternsSection(patterns);

        this.resultsContainer.appendChild(metricsSection);
        this.resultsContainer.appendChild(patternsSection);
    }

    createMetricsSection(metrics) {
        const metricsDiv = document.createElement('div');
        metricsDiv.className = 'metrics-section';

        const metricsTitle = document.createElement('h2');
        metricsTitle.textContent = 'Metrics';
        metricsDiv.appendChild(metricsTitle);

        for (const [key, value] of Object.entries(metrics)) {
            const metricItem = document.createElement('p');
            metricItem.textContent = `${key}: ${value}`;
            metricsDiv.appendChild(metricItem);
        }

        return metricsDiv;
    }

    createPatternsSection(patterns) {
        const patternsDiv = document.createElement('div');
        patternsDiv.className = 'patterns-section';

        const patternsTitle = document.createElement('h2');
        patternsTitle.textContent = 'Patterns';
        patternsDiv.appendChild(patternsTitle);

        patterns.forEach(pattern => {
            const patternItem = document.createElement('p');
            patternItem.textContent = `Pattern: ${pattern}`;
            patternsDiv.appendChild(patternItem);
        });

        return patternsDiv;
    }

    getResultsContainer() {
        return this.resultsContainer;
    }
}

export default ResultsView;