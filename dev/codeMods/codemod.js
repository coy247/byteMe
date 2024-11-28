module.exports = function (fileInfo, api) {
  return api
    .jscodeshift(fileInfo.source)
    .findVariableDeclarators("console")
    .forEach(function (consoleVariable) {
      consoleVariable.update("log", "info");
    })
    .toSource();
};
