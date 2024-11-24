const createUtilityFunctions = (j) => ({
  extractNumber: j.functionDeclaration(
    j.identifier("extractNumber"),
    [j.identifier("str"), j.identifier("radix")],
    j.blockStatement([
      j.ifStatement(
        j.binaryExpression(
          "===",
          j.unaryExpression("typeof", j.identifier("str")),
          j.literal("string")
        ),
        j.blockStatement([
          j.returnStatement(
            j.callExpression(j.identifier("parseInt"), [
              j.identifier("str"),
              j.identifier("radix"),
            ])
          ),
        ]),
        j.blockStatement([
          j.returnStatement(j.identifier("NaN"))
        ])
      )
    ])
  ),

  extractFloat: j.functionDeclaration(
    j.identifier("extractFloat"),
    [j.identifier("str")],
    j.blockStatement([
      j.tryStatement(
        j.blockStatement([
          j.returnStatement(
            j.callExpression(j.identifier("parseFloat"), [j.identifier("str")])
          ),
        ]),
        j.catchClause(
          j.identifier("error"),
          null,
          j.blockStatement([
            j.returnStatement(j.identifier("NaN"))
          ])
        )
      )
    ])
  )
});

export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);

  // Get utility functions
  const utilityFunctions = createUtilityFunctions(j);

  // Replace parseInt calls
  source
    .find(j.CallExpression, { callee: { name: 'parseInt' } })
    .replaceWith(path => {
      const args = path.value.arguments;
      return j.callExpression(
        j.identifier("extractNumber"),
        args.length > 1 ? args : [args[0], j.literal(10)]
      );
    });

  // Replace parseFloat calls
  source
    .find(j.CallExpression, { callee: { name: 'parseFloat' } })
    .replaceWith(path => {
      return j.callExpression(
        j.identifier("extractFloat"),
        [path.value.arguments[0]]
      );
    });

  // Add utility functions to the beginning of the file
  const program = source.find(j.Program);
  if (program.length > 0) {
    const utilityFunctionsList = Object.values(utilityFunctions);
    program.get(0).node.body.unshift(...utilityFunctionsList);
  }

  return source.toSource();
};
