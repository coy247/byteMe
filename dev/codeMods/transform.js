const path = require('path');

function reverseString(str) {
  return str.split('').reverse().join('');
}

function generateUniqueName(baseName, scope, declarations) {
  const scopeId = scope.path.node.type;
  let counter = 1;
  let name = `${baseName}_${scopeId}`;
  
  while (declarations.has(name)) {
    name = `${baseName}_${scopeId}_${counter++}`;
  }
  
  return name;
}

const transform = (fileInfo, api) => {
  if (!fileInfo || !fileInfo.source) return null;

  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const declarations = new Set();
  const scopes = new Map();

  // Track declarations by scope
  root
    .find(j.VariableDeclarator)
    .forEach(path => {
      const scope = path.scope;
      const name = path.node.id.name;
      declarations.add(name);
      
      if (!scopes.has(scope)) {
        scopes.set(scope, new Set());
      }
      scopes.get(scope).add(name);
    });

  // Transform performance identifiers
  root
    .find(j.Identifier)
    .forEach(path => {
      if (!path.node.name.match(/performance/i)) return;
      if (path.parent.node.type === 'ImportDeclaration') return;

      const newName = generateUniqueName(
        reverseString(path.node.name),
        path.scope,
        declarations
      );
      
      declarations.add(newName);
      path.node.name = newName;
    });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
};

module.exports = transform;
