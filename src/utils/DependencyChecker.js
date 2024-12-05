class DependencyChecker {
  static check() {
    const requiredDeps = ["@tensorflow/tfjs-node", "express", "mathjs"];
    const missing = [];
    requiredDeps.forEach((dep) => {
      try {
        require(dep);
      } catch (error) {
        missing.push(dep);
      }
    });
    if (missing.length > 0) {
      console.warn("Missing required dependencies: " + missing.join(", "));
      return false;
    }
    return true;
  }
}
module.exports = DependencyChecker;
