const jscodeshift = require("jscodeshift");
const sourceCode = `const a = 1;`;
const j = jscodeshift(sourceCode);
