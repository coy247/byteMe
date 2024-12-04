const path = require('path');
const os = require('os');

function resolveProjectPath(relativePath) {
    return path.join(process.cwd(), relativePath);
}

const paths = {
    models: resolveProjectPath('models'),
    data: resolveProjectPath('data'),
    config: resolveProjectPath('config')
};

module.exports = {
    resolveProjectPath,
    paths,
    resolveHealthPath: () => path.join(paths.data, 'health.json'),
    resolveScoresPath: () => path.join(paths.data, 'scores.json'),
    resolveModelDir: () => path.join(paths.models, 'patterns'),
    validatePath: (p) => typeof p === 'string' && p.length > 0
};