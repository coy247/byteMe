const j = require('jscodeshift');

function organizeIntoModules(fileInfo, api) {
  const root = j(fileInfo.source);
  const modules = new Map();

  // Find all function declarations and class declarations
  root
    .find(j.FunctionDeclaration)
    .concat(root.find(j.ClassDeclaration))
    .forEach(path => {
      const name = path.node.id.name;
      const dependencies = findDependencies(path);

      modules.set(name, {
        type: path.node.type,
        code: j(path).toSource(),
        dependencies
      });
    });

  // Helper function to find dependencies
  function findDependencies(path) {
    const dependencies = new Set();

    j(path)
      .find(j.Identifier)
      .forEach(id => {
        if (modules.has(id.node.name) && id.node.name !== path.node.id.name) {
          dependencies.add(id.node.name);
        }
      });

    return Array.from(dependencies);
  }

  // Generate modular output
  const output = Array.from(modules.entries()).map(([name, info]) => {
    return `// Module: ${name}
// Dependencies: ${info.dependencies.join(', ')}
${info.code}
export { ${name} };
`;
  }).join('\n\n');

  return output;
}

module.exports = organizeIntoModules;

