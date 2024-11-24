module.exports = (fileInfo, api) => {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .find(j.BinaryExpression, {
      operator: "+",
      left: { type: "Literal" },
      right: { type: "Literal" },
    })
    .replaceWith((path) => {
      return j.templateLiteral([path.value.left, path.value.right]);
    });
};
